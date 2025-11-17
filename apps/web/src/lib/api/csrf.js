//[P1][API][SECURITY] CSRF protection middleware
// Tags: csrf, security, double-submit-cookie
import { randomBytes, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
const DEFAULT_CONFIG = {
    cookieName: "csrf-token",
    headerName: "x-csrf-token",
    tokenLength: 32,
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
    },
};
export function generateCSRFToken(length = 32) {
    return randomBytes(length).toString("base64url");
}
export function verifyCSRFToken(token1, token2) {
    if (!token1 || !token2 || token1.length !== token2.length)
        return false;
    try {
        const buffer1 = Buffer.from(token1);
        const buffer2 = Buffer.from(token2);
        return timingSafeEqual(buffer1, buffer2);
    }
    catch {
        return false;
    }
}
function extractTokenFromRequest(request, headerName) {
    const headerToken = request.headers.get(headerName);
    if (headerToken)
        return headerToken;
    return null;
}
export function setCSRFCookie(response, token, config = DEFAULT_CONFIG) {
    const { cookieName, cookieOptions } = config;
    const cookieValue = [
        `${cookieName}=${token}`,
        `Path=/`,
        `Max-Age=${cookieOptions.maxAge}`,
        `SameSite=${cookieOptions.sameSite}`,
        cookieOptions.httpOnly ? "HttpOnly" : "",
        cookieOptions.secure ? "Secure" : "",
    ]
        .filter(Boolean)
        .join("; ");
    response.headers.set("Set-Cookie", cookieValue);
}
export function csrfProtection(config = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    return function (handler) {
        return async (request, context) => {
            const method = request.method.toUpperCase();
            if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
                return handler(request, context);
            }
            // Simplified extraction: prefer the public cookies API when available,
            // otherwise fall back to the Cookie header. Avoid inspecting internal
            // runtime properties to stay compatible across Next.js runtimes.
            let cookieToken = null;
            try {
                // runtime may expose request.cookies.get(name)
                const maybeCookies = request.cookies;
                if (maybeCookies && typeof maybeCookies.get === "function") {
                    cookieToken = maybeCookies.get(fullConfig.cookieName)?.value ?? null;
                }
            }
            catch {
                // ignore and fall back to header parsing
            }
            if (!cookieToken) {
                const cookiesHeader = request.headers.get("cookie") || "";
                const cookieMatch = cookiesHeader.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
                cookieToken = cookieMatch?.[1] ?? null;
            }
            if (!cookieToken) {
                return NextResponse.json({ error: "Forbidden - CSRF token missing from cookie", code: "CSRF_COOKIE_MISSING" }, { status: 403 });
            }
            const requestToken = extractTokenFromRequest(request, fullConfig.headerName);
            if (!requestToken) {
                return NextResponse.json({
                    error: `Forbidden - CSRF token missing from ${fullConfig.headerName} header`,
                    code: "CSRF_HEADER_MISSING",
                }, { status: 403 });
            }
            if (!verifyCSRFToken(cookieToken, requestToken)) {
                return NextResponse.json({ error: "Forbidden - CSRF token mismatch", code: "CSRF_TOKEN_INVALID" }, { status: 403 });
            }
            return handler(request, context);
        };
    };
}
export function withCSRFToken(handler, config = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    return async (request, context) => {
        // Prefer the public cookies API when available; otherwise fallback to Cookie header.
        let token = null;
        try {
            const maybeCookies = request.cookies;
            if (maybeCookies && typeof maybeCookies.get === "function") {
                token = maybeCookies.get(fullConfig.cookieName)?.value ?? null;
            }
        }
        catch {
            // ignore and fall back
        }
        if (!token) {
            const cookiesHeader = request.headers.get("cookie") || "";
            const cookieMatch = cookiesHeader.match(new RegExp(`${fullConfig.cookieName}=([^;]+)`));
            token = cookieMatch?.[1] ?? null;
        }
        const hadCookie = token != null;
        if (!token)
            token = generateCSRFToken(fullConfig.tokenLength);
        const response = await handler(request, context);
        if (!hadCookie) {
            setCSRFCookie(response, token, fullConfig);
        }
        return response;
    };
}
export const verifyCsrf = verifyCSRFToken;
export const withCsrf = csrfProtection;
