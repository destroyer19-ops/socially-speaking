import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ny1i8c8u',
    dataset: 'production'
  },
  deployment: {
    appId: 'wcb4edvy8ks4xlx0yynucjt0',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
