const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

module.exports = function withAdiRegistration(config) {
  return withDangerousMod(config, [
    'android',
    async currentConfig => {
      const projectRoot = currentConfig.modRequest.projectRoot;
      const androidRoot = currentConfig.modRequest.platformProjectRoot;
      const sourcePath = path.join(projectRoot, 'assets', 'adi-registration.properties');
      const targetDir = path.join(androidRoot, 'app', 'src', 'main', 'assets');
      const targetPath = path.join(targetDir, 'adi-registration.properties');

      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Missing required registration file: ${sourcePath}`);
      }

      fs.mkdirSync(targetDir, { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);

      return currentConfig;
    },
  ]);
};
