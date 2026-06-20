<?php
/**
 * Core configuration for LeadCop API connection.
 */

if (!defined('ABSPATH')) {
    exit;
}

class LeadCop_Config {

    /**
     * Resolve the base API URL using cascading priority.
     * 1. LEADCOP_API_BASE constant (if explicitly defined in wp-config.php)
     * 2. $_ENV['LEADCOP_API_BASE']
     * 3. Production Default
     *
     * @return string
     */
    public static function get_api_base_url() {
        if (defined('LEADCOP_API_BASE')) {
            return LEADCOP_API_BASE;
        }

        if (isset($_ENV['LEADCOP_API_BASE']) && !empty($_ENV['LEADCOP_API_BASE'])) {
            return $_ENV['LEADCOP_API_BASE'];
        }

        return 'https://api.leadcop.io/api/v1';
    }
}
