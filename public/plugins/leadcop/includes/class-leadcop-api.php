<?php
if (!defined('ABSPATH')) {
    exit;
}

class LeadCop_API {
    
    private $api_key;
    
    public function __construct() {
        $this->api_key = get_option('leadcop_api_key', '');
    }
    
    public function is_connected() {
        return !empty($this->api_key);
    }

    public function set_api_key($key) {
        $this->api_key = sanitize_text_field($key);
        update_option('leadcop_api_key', $this->api_key);
    }
    
    public function disconnect() {
        $this->api_key = '';
        delete_option('leadcop_api_key');
        delete_transient('leadcop_status_cache');
    }

    /**
     * Connect to LeadCop and register/verify domain
     */
    public function connect($key) {
        $response = wp_remote_post(LEADCOP_API_BASE . '/plugin/connect', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-api-key' => sanitize_text_field($key),
                'Referer' => home_url()
            ),
            'body' => wp_json_encode(array('hostname' => home_url())),
            'timeout' => 10
        ));
        
        if (is_wp_error($response)) {
            return array('success' => false, 'error' => sprintf(esc_html__('Network error: %s', 'leadcop'), $response->get_error_message()));
        }
        
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($code !== 200) {
            return array('success' => false, 'error' => isset($data['error']) ? $data['error'] : sprintf(esc_html__('API Error (%d)', 'leadcop'), $code));
        }
        
        // Save key on success
        $this->set_api_key($key);
        delete_transient('leadcop_status_cache');
        
        return array('success' => true, 'data' => $data['data']);
    }

    /**
     * Fetch Usage, Plan, and Metrics (Cached for 5 mins to prevent rate limits on admin pages)
     */
    public function get_status($force_refresh = false) {
        if (!$this->is_connected()) return false;
        
        if (!$force_refresh) {
            $cached = get_transient('leadcop_status_cache');
            if ($cached !== false) return $cached;
        }

        $response = wp_remote_post(LeadCop_Config::get_api_base_url() . '/plugin/status', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-api-key' => $this->api_key,
                'Referer' => home_url()
            ),
            'body' => wp_json_encode(array('hostname' => home_url())),
            'timeout' => 10
        ));
        
        if (is_wp_error($response)) {
            return false;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if ($code === 403) {
            return array('is_suspended' => true, 'error' => isset($data['error']) ? $data['error'] : esc_html__('Unauthorized', 'leadcop'));
        }

        if ($code !== 200) {
            return false;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['success']) && $data['success']) {
            set_transient('leadcop_status_cache', $data['data'], 300); // 5 min cache
            return $data['data'];
        }
        
        return false;
    }

    /**
     * Core Validation Engine Hook
     */
    public function validate_email($email) {
        if (!$this->is_connected()) {
            return array('valid' => true, 'error' => esc_html__('Plugin not configured.', 'leadcop'));
        }

        $response = wp_remote_post(LeadCop_Config::get_api_base_url() . '/validate', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-api-key' => $this->api_key,
                'Referer' => home_url()
            ),
            'body' => wp_json_encode(array('email' => $email)),
            'timeout' => 5 // 5 second strict timeout
        ));
        
        if (is_wp_error($response)) {
            return array('valid' => false, 'error' => esc_html__('Validation service unavailable.', 'leadcop'));
        }
        
        $code = wp_remote_retrieve_response_code($response);
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['error'])) {
            // Unhandled network or server errors that didn't follow our JSON format
            error_log('[LeadCop] API Error: ' . $data['error']);
            return array('valid' => false, 'error' => $data['error']);
        }
        
        return $data;
    }
}
