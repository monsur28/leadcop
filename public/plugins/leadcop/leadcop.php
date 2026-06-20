<?php
/**
 * Plugin Name: LeadCop
 * Plugin URI: https://leadcop.io
 * Description: Advanced server-side email validation and typo correction for all major WordPress forms.
 * Version: 2.0.0
 * Requires at least: 5.0
 * Tested up to: 6.5
 * Requires PHP: 7.4
 * Author: LeadCop
 * Author URI: https://leadcop.io
 * License: GPLv2 or later
 * Text Domain: leadcop
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly for security
}

define('LEADCOP_VERSION', '1.0.0');
define('LEADCOP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LEADCOP_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once LEADCOP_PLUGIN_DIR . 'includes/class-leadcop-config.php';

// Autoload core classes
require_once LEADCOP_PLUGIN_DIR . 'includes/class-leadcop-api.php';
require_once LEADCOP_PLUGIN_DIR . 'includes/class-leadcop-forms.php';
require_once LEADCOP_PLUGIN_DIR . 'includes/class-leadcop-admin.php';

// Plugin Activation Cleanup
register_activation_hook(__FILE__, 'leadcop_activation_cleanup');
function leadcop_activation_cleanup() {
    delete_option('leadcop_allow_public');
    delete_option('leadcop_allow_role');
    delete_option('leadcop_allow_disposable');
}

// Load Text Domain
function leadcop_load_textdomain() {
    load_plugin_textdomain('leadcop', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('plugins_loaded', 'leadcop_load_textdomain');

// Initialize Plugin
function leadcop_init() {
    $api = new LeadCop_API();
    new LeadCop_Admin($api);
    
    // Only init forms if connected
    if ($api->is_connected()) {
        new LeadCop_Forms($api);
    }
}
add_action('plugins_loaded', 'leadcop_init');
