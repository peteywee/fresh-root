// Shim to forward to archived copy so Husky hooks keep working after moving scripts
import("./../archive/scripts/tag-files.mjs").catch((err) => {
  console.error(err);
  process.exit(1);
});
