module.exports = {
  apps: [
    {
      name: 'staytrack-backend',
      script: 'npm',
      args: 'start',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 8080,
        NODE_ENV: 'production'
      },
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
    }
  ],
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo/staytrack.git',
      path: '/var/www/staytrack',
      'post-deploy': 'npm install && cd frontend && npm install && npm run build && cd ../backend && npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};