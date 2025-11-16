// [P0][TEST][ENV] SetupEnv tests
// Tags: P0, TEST, ENV, TEST
import fs from "fs";
import path from "path";

try {
  const cfgPath = path.join(process.cwd(), "firebase.test.json");
  if (fs.existsSync(cfgPath)) {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const emu = cfg?.emulators;
    if (emu?.firestore?.host && emu?.firestore?.port) {
      const host = `${emu.firestore.host}:${emu.firestore.port}`;
      if (!process.env.FIRESTORE_EMULATOR_HOST) process.env.FIRESTORE_EMULATOR_HOST = host;
      if (!process.env.FIREBASE_FIRESTORE_EMULATOR_HOST)
        process.env.FIREBASE_FIRESTORE_EMULATOR_HOST = host;
    }
    if (emu?.storage?.host && emu?.storage?.port) {
      const host = `${emu.storage.host}:${emu.storage.port}`;
      if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST)
        process.env.FIREBASE_STORAGE_EMULATOR_HOST = host;
    }
    if (emu?.hub?.host && emu?.hub?.port) {
      const host = `${emu.hub.host}:${emu.hub.port}`;
      if (!process.env.FIREBASE_EMULATOR_HUB) process.env.FIREBASE_EMULATOR_HUB = host;
    }
  }
} catch (e) {
  // ignore
}
