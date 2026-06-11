import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { VitePlugin } from '@electron-forge/plugin-vite'
import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import path from 'path'
import { platform } from 'process'
import dotenv from 'dotenv'

// 即使没有.env文件也不会报错
dotenv.config({
  path: path.resolve(__dirname, '.env'),
})
console.log('CHAT_GITHUB_TOKEN==', process.env.CHAT_GITHUB_TOKEN)

// app图标
let iconPath = ''
if (platform === 'darwin') {
  // macOS
  iconPath = path.resolve(__dirname + '/src/assets/icons/mac/icon.icns')
} else if (platform === 'win32') {
  iconPath = path.resolve(__dirname + '/src/assets/icons/win/icon.ico')
} else {
  //linux
  iconPath = path.resolve(__dirname + '/src/assets/icons/png/512x512.png')
}

const config: ForgeConfig = {
  packagerConfig: {
    appBundleId: 'com.xiaowu.mychat',
    icon: iconPath,
    asar: true,
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        authToken: process.env.CHAT_GITHUB_TOKEN,
        repository: {
          owner: '15240021857',
          name: 'wx-electron-intel-chat',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config
