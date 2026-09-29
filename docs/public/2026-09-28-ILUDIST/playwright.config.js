import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  timeout:30000,
  fullyParallel:false,
  workers:1,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
  webServer:{command:'node tools/server.mjs',url:'http://127.0.0.1:4173/01-folio/',reuseExistingServer:true},
  projects:[
    {name:'chromium-phone',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}},
    {name:'webkit-phone',use:{...devices['iPhone 13'],defaultBrowserType:'webkit'}},
    {name:'desktop',use:{viewport:{width:1440,height:1000},browserName:'chromium'}}
  ]
});
