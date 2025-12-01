#!/usr/bin/env python3
# [P2][APP][CODE] Convert To Sdk
# Tags: P2, APP, CODE
"""
Convert remaining routes from withSecurity to SDK factories.
Handles complex nested patterns properly.
"""

import re
import sys
from pathlib import Path

def detect_factory(content):
    """Detect which factory to use based on auth patterns"""
    if 'requireOrgMembership' in content:
        return 'createOrgEndpoint'
    if 'requireRole' in content or 'requireAuth' in content:
        return 'createAuthenticatedEndpoint'
    return 'createPublicEndpoint'

def extract_handler_and_options(content):
    """Extract the handler function and security options from withSecurity(...)"""
    # Pattern: export const METHOD = withSecurity(handler, options);
    # The handler can be a complex nested expression
    
    # Find the export statement
    match = re.search(
        r'export\s+const\s+(\w+)\s*=\s*withSecurity\s*\((.*?)\s*,\s*(\{.*?\})\s*\);',
        content,
        re.DOTALL
    )
    
    if not match:
        return None
    
    method_name = match.group(1)
    handler = match.group(2).strip()
    options_str = match.group(3).strip()
    
    # Extract rate limit from options
    rate_limit_match = re.search(r'maxRequests:\s*(\d+),\s*windowMs:\s*(\d+)', options_str)
    rate_limit = None
    if rate_limit_match:
        rate_limit = f"{{ maxRequests: {rate_limit_match.group(1)}, windowMs: {rate_limit_match.group(2)} }}"
    
    return {
        'method': method_name,
        'handler': handler,
        'options': options_str,
        'rate_limit': rate_limit,
        'match': match
    }

def convert_route(filepath):
    """Convert a single route file"""
    content = filepath.read_text()
    original = content
    
    if 'withSecurity' not in content:
        return False, "No withSecurity found"
    
    if 'createAuthenticatedEndpoint' in content or 'createPublicEndpoint' in content:
        return False, "Already has SDK factories"
    
    factory = detect_factory(content)
    
    # Clean imports first
    content = re.sub(
        r'^import\s*\{[^}]*\bwithSecurity\b[^}]*\}\s+from\s+["\'].*?middleware["\'];?\n?',
        '',
        content,
        flags=re.MULTILINE
    )
    content = re.sub(
        r'^import\s*\{[^}]*\b(parseJson|badRequest|serverError|ok)\b[^}]*\}\s+from[^\n]+;?\n?',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Add SDK import if not present
    if '@fresh-schedules/api-framework' not in content:
        # Find the last import line
        last_import = max(
            [m.end() for m in re.finditer(r'^import\s+.*$', content, re.MULTILINE)],
            default=0
        )
        if last_import:
            insert_pos = content.find('\n', last_import) + 1
            content = (
                content[:insert_pos] +
                f'import {{ {factory} }} from "@fresh-schedules/api-framework";\n' +
                content[insert_pos:]
            )
        else:
            content = f'import {{ {factory} }} from "@fresh-schedules/api-framework";\n\n' + content
    
    # Convert withSecurity exports - handle all patterns
    def replace_withsecurity(match):
        method = match.group(1)
        rest = match.group(2)
        
        # Extract handler and options (options may not exist)
        options_match = re.search(r',\s*(\{[^}]*\})\s*\);?$', rest, re.DOTALL)
        
        if options_match:
            # Has options
            handler_part = rest[:options_match.start()].strip()
            options = options_match.group(1)
        else:
            # No options
            handler_part = re.sub(r'\s*\);?\s*$', '', rest, flags=re.DOTALL).strip()
            options = None
        
        handler = handler_part
        
        # Unwrap nested requireOrgMembership, requireRole
        handler = re.sub(r'requireOrgMembership\s*\(\s*', '', handler)
        handler = re.sub(r'requireRole\s*\([^)]*\)\s*\(\s*', '', handler)
        
        # Remove trailing closing parens from unwrapping
        while handler.endswith(')'):
            handler = handler[:-1].rstrip()
        
        handler = handler.rstrip(',').rstrip()
        
        # Extract rate limit
        rate_limit = ''
        if options:
            ml = re.search(r'maxRequests:\s*(\d+),\s*windowMs:\s*(\d+)', options)
            if ml:
                rate_limit = f",\n  rateLimit: {{ maxRequests: {ml.group(1)}, windowMs: {ml.group(2)} }}"
        
        # Don't wrap in extra parens/async if already wrapped
        if handler.startswith('async'):
            body = handler
        else:
            body = f"return ({handler})"
        
        return f'''export const {method} = {factory}({{
  handler: async ({{ request, input, context, params }}) => {{
    {body};
  }}{rate_limit}
}});'''
    
    # Match: export const METHOD = withSecurity(... up to );
    content = re.sub(
        r'export\s+const\s+(\w+)\s*=\s*withSecurity\s*\(([\s\S]*?)\);',
        replace_withsecurity,
        content,
        flags=re.MULTILINE
    )
    
    # Clean up extra newlines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    if content != original:
        filepath.write_text(content)
        return True, "Converted"
    
    return False, "No changes"

def main():
    routes_dir = Path('/home/patrick/fresh-root/apps/web/app/api')
    
    # Find all routes with withSecurity
    routes = []
    for route_file in routes_dir.rglob('route.ts'):
        content = route_file.read_text()
        if 'export' in content and 'withSecurity' in content:
            routes.append(route_file)
    
    print(f"\n🔧 Converting {len(routes)} routes\n")
    
    converted = 0
    for route in sorted(routes):
        success, msg = convert_route(route)
        rel_path = route.relative_to(routes_dir)
        if success:
            print(f"  ✅ {rel_path}")
            converted += 1
        else:
            print(f"  ⚠️  {rel_path} ({msg})")
    
    print(f"\n✅ Converted {converted} routes\n")
    return 0 if converted > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
