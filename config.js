'use strict';

module.exports = {
      PORT: process.env.PORT || 8080,
      CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      key: process.env.key,
      DATABASE_URL:
            process.env.DATABASE_URL || 'mongodb://admin:admin123@ds115263.mlab.com:15263/parks',
      TEST_DATABASE_URL:
            process.env.TEST_DATABASE_URL ||
            'mongodb://localhost/yelp-for-parks-backend-test'
};
