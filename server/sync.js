// ===========================================
// Wiki.js - Background Agent
// 1.0.0
// Licensed under AGPLv3
// ===========================================

// Runs a single 'sync'. This is usually taken care of by the agent.

const path = require('path')
const ROOTPATH = process.cwd()
const SERVERPATH = path.join(ROOTPATH, 'server')

global.ROOTPATH = ROOTPATH
global.SERVERPATH = SERVERPATH
const IS_DEBUG = process.env.NODE_ENV === 'development'

let appconf = require('./libs/config')()
global.appconfig = appconf.config
global.appdata = appconf.data

// ----------------------------------------
// Load Winston
// ----------------------------------------

global.winston = require('./libs/logger')(IS_DEBUG, 'AGENT')

// ----------------------------------------
// Load global modules
// ----------------------------------------

global.winston.info('Sync is initializing...')

global.db = require('./libs/db').init()
global.git = require('./libs/git').init()
global.cache = require('./libs/cache').init()
global.lang = require('i18next')
global.mark = require('./libs/markdown')

// ----------------------------------------
// Load modules
// ----------------------------------------

const i18nBackend = require('i18next-node-fs-backend')

// ----------------------------------------
// Localization Engine
// ----------------------------------------

global.lang
  .use(i18nBackend)
  .init({
    load: 'languageOnly',
    ns: ['common', 'admin', 'auth', 'errors', 'git'],
    defaultNS: 'common',
    saveMissing: false,
    preload: [appconfig.lang],
    lng: appconfig.lang,
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(SERVERPATH, 'locales/{{lng}}/{{ns}}.json')
    }
  })


global.git.onReady.then(() => { global.git.resync().then(() => { global.cache.update() }) })
