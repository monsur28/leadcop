<?php
if (!defined('ABSPATH')) {
    exit;
}

class LeadCop_Forms {

    private $api;

    public function __construct(LeadCop_API $api) {
        $this->api = $api;
        
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

    private function process_validation_result($result) {
        if (isset($result['error'])) {
            return $result['error'];
        }

        if (isset($result['valid']) && $result['valid']) {
            if (isset($result['reason']) && $result['reason'] === 'TYPO' && !empty($result['message'])) {
                // Return the pre-formatted backend typo message.
                // Note: CF7 and WPForms render raw text, but Gravity Forms can render HTML. 
                return $result['message'];
            }
            return true;
        }
        
        return isset($result['message']) ? $result['message'] : esc_html__('Invalid email address.', 'leadcop');
    }

    // -------------------------------------------------------------------------
    // INTEGRATION HOOKS
    // -------------------------------------------------------------------------

    public function validate_cf7($result, $tag) {
        $name = $tag->name;
        $value = isset($_POST[$name]) ? trim(wp_unslash((string) $_POST[$name])) : '';
        
        if ($value !== '') {
            $api_result = $this->api->validate_email($value);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                $result->invalidate($tag, $processed);
            }
        }
        return $result;
    }

    public function validate_wpforms($field_id, $field_submit, $form_data) {
        $value = trim(wp_unslash((string) $field_submit));
        if ($value !== '') {
            $api_result = $this->api->validate_email($value);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                wpforms()->process->errors[$form_data['id']][$field_id] = $processed;
            }
        }
    }

    public function validate_gravity_forms($validation_result) {
        $form = $validation_result['form'];
        $is_valid = true;
        
        foreach ($form['fields'] as &$field) {
            if ($field->type === 'email') {
                $value = rgpost('input_' . $field->id);
                if (!empty($value)) {
                    $api_result = $this->api->validate_email($value);
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

    public function validate_elementor($field, $record, $ajax_handler) {
        $value = $field['value'];
        if (!empty($value)) {
            $api_result = $this->api->validate_email($value);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                $ajax_handler->add_error($field['id'], $processed);
            }
        }
    }

    public function validate_ninja_forms($form_data) {
        foreach ($form_data['fields'] as &$field) {
            if ($field['type'] === 'email' && !empty($field['value'])) {
                $api_result = $this->api->validate_email($field['value']);
                $processed = $this->process_validation_result($api_result);
                if ($processed !== true) {
                    $form_data['errors']['fields'][$field['id']] = $processed;
                }
            }
        }
        return $form_data;
    }

    public function validate_woocommerce($data, $errors) {
        $email = isset($data['billing_email']) ? trim($data['billing_email']) : '';
        if ($email !== '') {
            $api_result = $this->api->validate_email($email);
            $processed = $this->process_validation_result($api_result);
            if ($processed !== true) {
                $errors->add('billing_email_error', '<strong>' . esc_html__('Billing Email:', 'leadcop') . '</strong> ' . $processed);
            }
        }
    }
}
