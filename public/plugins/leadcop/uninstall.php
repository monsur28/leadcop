<?php
/**
 * LeadCop Uninstall
 *
 * Fired when the plugin is deleted.
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Clean up options
delete_option('leadcop_api_key');

// Clean up legacy options
delete_option('leadcop_allow_public');
delete_option('leadcop_allow_role');
delete_option('leadcop_allow_disposable');

// Clean up transients
delete_transient('leadcop_status_cache');
