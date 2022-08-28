declare global {
  namespace NodeJS {
    interface ProcessEnv {
      pusher_app_id: string;
      pusher_key: string;
      pusher_secret: string;
      pusher_cluster: string;
      GITHUB_AUTH_TOKEN: string;
      NODE_ENV: `development` | `production`;
      PORT?: string;
      PWD: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
