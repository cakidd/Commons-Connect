/**
 * Node.js script to use localtunnel and auto reconnect
 * usage: node localtunnel-persistent.js port=8080 subdomain=mountainshares
 */

const assert = require('assert');
const localtunnel = require('localtunnel');

var argv = process.argv.reduce(function(accumulator, str) {
  if (str.indexOf('=') > -1) {
    var split = str.split('=');
    var val = split[1].match(/^\d+$/) ? Number(split[1]) : split[1];
    accumulator[split[0]] = val;
  }
  return accumulator;
}, {});

const port = argv.port || 8080;
const subdomain = argv.subdomain || 'mountainshares';
const reconnectionTimeout = argv.timeout || 1000;

console.log('🏔️ MountainShares LocalTunnel Starting...');
console.log('Port:', port, 'Subdomain:', subdomain);

function openLocalTunnel() {
  try {
    var tunnel = localtunnel(port, { subdomain: subdomain }, function(error, tunnel) {
      if (error) {
        console.log('❌ Tunnel error, retrying in', reconnectionTimeout, 'ms');
        return setTimeout(openLocalTunnel, reconnectionTimeout);
      }
      console.log('✅ Tunnel opened:', { port: port, url: tunnel.url });
      console.log('🚀 MountainShares backend accessible at:', tunnel.url);
    });

    tunnel.on('error', function(err) {
      console.log('❌ Tunnel error:', err.message);
      setTimeout(openLocalTunnel, reconnectionTimeout);
    });

    tunnel.on('close', function() {
      console.log('⚠️ Tunnel closed, reconnecting...');
      setTimeout(openLocalTunnel, reconnectionTimeout);
    });
  } catch(error) {
    console.log('❌ Exception:', error.message);
    setTimeout(openLocalTunnel, reconnectionTimeout);
  }
}

openLocalTunnel();
