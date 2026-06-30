module.exports = {
  apps: [{
    name: 'youtu-edu',
    script: 'backend/app.js',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
