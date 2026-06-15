<?php
/**
 * Plugin Name: LeadCop
 * Plugin URI: https://leadcop.io
 * Description: Advanced server-side email validation and typo correction for all major WordPress forms.
 * Version: 1.0.0
 * Author: LeadCop
 * Author URI: https://leadcop.io
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly for security
}

class LeadCop_Plugin {
    private $api_endpoint = 'https://api.leadcop.io/api/v1/validate';
    
    public function __construct() {
        // Register Settings
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        
        // Hooks are only bound if the API key is configured
        if ($this->get_api_key()) {
            $this->init_integrations();
        }
    }
    
    private function get_api_key() {
        return get_option('leadcop_api_key', '');
    }
    
    public function add_settings_page() {
        add_options_page('LeadCop', 'LeadCop', 'manage_options', 'leadcop', array($this, 'render_settings_page'));
    }
    
    public function register_settings() {
        register_setting('leadcop_settings', 'leadcop_api_key');
        register_setting('leadcop_settings', 'leadcop_allow_public');
        register_setting('leadcop_settings', 'leadcop_allow_role');
        register_setting('leadcop_settings', 'leadcop_allow_disposable');
    }
    
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h2>LeadCop Validation Settings</h2>
            <form method="post" action="options.php">
                <?php settings_fields('leadcop_settings'); ?>
                <?php do_settings_sections('leadcop_settings'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">API Key (Secret or Public)</th>
                        <td><input type="text" name="leadcop_api_key" value="<?php echo esc_attr(get_option('leadcop_api_key')); ?>" style="width: 350px;" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Allow Public Domains (e.g. gmail.com)</th>
                        <td><input type="checkbox" name="leadcop_allow_public" value="1" <?php checked(1, get_option('leadcop_allow_public'), true); ?> /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Allow Role Accounts (e.g. admin@)</th>
                        <td><input type="checkbox" name="leadcop_allow_role" value="1" <?php checked(1, get_option('leadcop_allow_role'), true); ?> /></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    private function init_integrations() {
        // 1. Contact Form 7
        add_filter('wpcf7_validate_email', array($this, 'validate_cf7'), 20, 2);
        add_filter('wpcf7_validate_email*', array($this, 'validate_cf7'), 20, 2);
        
        // 2. WPForms
        add_filter('wpforms_process_validate_email', array($this, 'validate_wpforms'), 10, 3);
        
        // 3. Gravity Forms
        add_filter('gform_validation', array($this, 'validate_gravity_forms'));
        
        // 4. Elementor Forms
        add_action('elementor_pro/forms/validation/email', array($this, 'validate_elementor'), 10, 3);
        
        // 5. Ninja Forms
        add_filter('ninja_forms_submit_data', array($this, 'validate_ninja_forms'));
        
        // 6. WooCommerce Checkout
        add_action('woocommerce_after_checkout_validation', array($this, 'validate_woocommerce'), 10, 2);
    }
    
    /**
     * Core API Call
     * Uses wp_remote_post with a strict timeout to ensure fail-safe operation.
     */
    private function validate_email_api($email) {
        $api_key = $this->get_api_key();
        
        $response = wp_remote_post($this->api_endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'x-api-key' => $api_key,
                'Referer' => home_url() // Ensure API origin checks pass
            ),
            'body' => wp_json_encode(array('email' => $email)),
            'timeout' => 5 // 5 second fail-safe timeout
        ));
        
        if (is_wp_error($response)) {
            // Fail-safe: API is offline. Allow submission.
            return array('valid' => true);
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (isset($data['error'])) {
            // Fail-safe: Quota exceeded or invalid key. Allow submission.
            error_log('[LeadCop] API Error: ' . $data['error']);
            return array('valid' => true);
        }
        
        return $data;
    }
    
    /**
     * Centralized Error Message Processor
     * Returns true if valid, or an error string if invalid.
     */
    private function process_validation_result($result) {
        if ($result['valid']) {
            if ($result['type'] === 'TYPO' && !empty($result['suggestion'])) {
                return 'Did you mean ' . $result['suggestion'] . '?';
            }
            return true;
        }
        
        // Local Configuration Overrides
        if ($result['type'] === 'PUBLIC' && get_option('leadcop_allow_public')) return true;
        if ($result['type'] === 'ROLE' && get_option('leadcop_allow_role')) return true;
        if ($result['type'] === 'DISPOSABLE' && get_option('leadcop_allow_disposable')) return true;
        
        $msgs = array(
            'INVALID_SYNTAX' => 'Please enter a valid email address.',
            'INVALID_TLD' => 'The domain ending is invalid.',
            'DISPOSABLE' => 'Disposable emails are not allowed.',
            'ROLE' => 'Please use a personal email address.',
            'PUBLIC' => 'Please use your business email address.',
            'BLOCKLISTED' => 'This email is not allowed by the administrator.'
        );
        
        return isset($msgs[$result['type']]) ? $msgs[$result['type']] : 'Invalid email address.';
    }

    // -------------------------------------------------------------------------
    // INTEGRATION HOOKS
    // -------------------------------------------------------------------------

    // 1. Contact Form 7
    public function validate_cf7($result, $tag) {
        $name = $tag->name;
        $value = isset($_POST[$name]) ? trim(wp_unslash((string) $_POST[$name])) : '';
        
        if ($value !== '') {
            $api_result = $this->validate_email_api($value);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                $result->invalidate($tag, $processed);
            }
        }
        return $result;
    }

    // 2. WPForms
    public function validate_wpforms($field_id, $field_submit, $form_data) {
        $value = trim(wp_unslash((string) $field_submit));
        if ($value !== '') {
            $api_result = $this->validate_email_api($value);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                wpforms()->process->errors[$form_data['id']][$field_id] = $processed;
            }
        }
    }

    // 3. Gravity Forms
    public function validate_gravity_forms($validation_result) {
        $form = $validation_result['form'];
        $is_valid = true;
        
        foreach ($form['fields'] as &$field) {
            if ($field->type === 'email') {
                $value = rgpost('input_' . $field->id);
                if (!empty($value)) {
                    $api_result = $this->validate_email_api($value);
                    $processed = $this->process_validation_result($api_result);
                    
                    if ($processed !== true) {
                        $is_valid = false;
                        $field->failed_validation = true;
                        $field->validation_message = $processed;
                    }
                }
            }
        }
        $validation_result['is_valid'] = $is_valid;
        $validation_result['form'] = $form;
        return $validation_result;
    }

    // 4. Elementor Forms
    public function validate_elementor($field, $record, $ajax_handler) {
        $value = $field['value'];
        if (!empty($value)) {
            $api_result = $this->validate_email_api($value);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                $ajax_handler->add_error($field['id'], $processed);
            }
        }
    }

    // 5. Ninja Forms
    public function validate_ninja_forms($form_data) {
        foreach ($form_data['fields'] as &$field) {
            if ($field['type'] === 'email' && !empty($field['value'])) {
                $api_result = $this->validate_email_api($field['value']);
                $processed = $this->process_validation_result($api_result);
                if ($processed !== true) {
                    $form_data['errors']['fields'][$field['id']] = $processed;
                }
            }
        }
        return $form_data;
    }

    // 6. WooCommerce Checkout
    public function validate_woocommerce($data, $errors) {
        $email = isset($data['billing_email']) ? trim($data['billing_email']) : '';
        if ($email !== '') {
            $api_result = $this->validate_email_api($email);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                $errors->add('billing_email_error', '<strong>Billing Email:</strong> ' . $processed);
            }
        }
    }
}

new LeadCop_Plugin();
