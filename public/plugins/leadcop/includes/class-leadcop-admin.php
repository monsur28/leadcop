<?php
if (!defined('ABSPATH')) {
    exit;
}

class LeadCop_Admin {

    private $api;

    public function __construct(LeadCop_API $api) {
        $this->api = $api;
        
        add_action('admin_menu', array($this, 'register_menus'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
        
        // AJAX Endpoints
        add_action('wp_ajax_leadcop_verify_connection', array($this, 'ajax_verify_connection'));
        add_action('wp_ajax_leadcop_disconnect', array($this, 'ajax_disconnect'));
    }

    public function register_menus() {
        // Main Menu
        add_menu_page(
            'LeadCop',
            'LeadCop',
            'manage_options',
            'leadcop-overview',
            array($this, 'render_overview'),
            'dashicons-shield',
            58
        );

        add_submenu_page('leadcop-overview', esc_html__('Overview', 'leadcop'), esc_html__('Overview', 'leadcop'), 'manage_options', 'leadcop-overview', array($this, 'render_overview'));
        add_submenu_page('leadcop-overview', esc_html__('Connection', 'leadcop'), esc_html__('Connection', 'leadcop'), 'manage_options', 'leadcop-connection', array($this, 'render_connection'));
        add_submenu_page('leadcop-overview', esc_html__('Usage', 'leadcop'), esc_html__('Usage', 'leadcop'), 'manage_options', 'leadcop-usage', array($this, 'render_usage'));
        add_submenu_page('leadcop-overview', esc_html__('Integrations', 'leadcop'), esc_html__('Integrations', 'leadcop'), 'manage_options', 'leadcop-integrations', array($this, 'render_integrations'));
        add_submenu_page('leadcop-overview', esc_html__('Settings', 'leadcop'), esc_html__('Settings', 'leadcop'), 'manage_options', 'leadcop-settings', array($this, 'render_settings'));
        add_submenu_page('leadcop-overview', esc_html__('Documentation', 'leadcop'), esc_html__('Documentation', 'leadcop'), 'manage_options', 'leadcop-docs', array($this, 'render_docs'));
    }

    public function enqueue_assets($hook) {
        if (strpos($hook, 'leadcop') === false) {
            return;
        }

        wp_enqueue_style('leadcop-admin-css', LEADCOP_PLUGIN_URL . 'admin/css/leadcop-admin.css', array(), LEADCOP_VERSION);
        wp_enqueue_script('leadcop-admin-js', LEADCOP_PLUGIN_URL . 'admin/js/leadcop-admin.js', array('jquery'), LEADCOP_VERSION, true);

        wp_localize_script('leadcop-admin-js', 'leadcop_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('leadcop_admin_nonce'),
            'i18n'     => array(
                'enterKey'          => esc_html__('Please enter an API Key.', 'leadcop'),
                'connecting'        => esc_html__('Connecting...', 'leadcop'),
                'connected'         => esc_html__('Connected successfully! Redirecting...', 'leadcop'),
                'connectBtn'        => esc_html__('Connect LeadCop', 'leadcop'),
                'networkError'      => esc_html__('Network error. Please try again.', 'leadcop'),
                'confirmDisconnect' => esc_html__('Are you sure you want to disconnect? Forms will no longer be protected.', 'leadcop'),
                'disconnecting'     => esc_html__('Disconnecting...', 'leadcop')
            )
        ));
    }

    private function render_wrapper($view_file) {
        // Enforce Connection Redirection
        if (!$this->api->is_connected() && $view_file !== 'view-connection.php') {
            echo '<script>window.location.href="?page=leadcop-connection";</script>';
            exit;
        }

        $api = $this->api;
        $status_data = $api->get_status();
        
        echo '<div class="wrap leadcop-wrap">';
        
        // Global Banner
        if (!$this->api->is_connected()) {
            echo '<div class="lc-banner lc-banner-danger" role="alert"><p><strong>' . esc_html__('Action Required:', 'leadcop') . '</strong> ' . esc_html__('LeadCop is not connected. Please enter your API key to activate protection.', 'leadcop') . '</p></div>';
        } else if (isset($status_data['is_suspended'])) {
            echo '<div class="lc-banner lc-banner-danger" role="alert">
                    <h3 style="margin-top:0; color: #991B1B;">' . esc_html__('Account Suspended', 'leadcop') . '</h3>
                    <p>' . esc_html__('Your LeadCop account is currently suspended. Forms are unprotected.', 'leadcop') . '</p>
                    <p style="margin-top: 10px;">' . esc_html__('Please contact support.', 'leadcop') . '</p>
                  </div>';
            echo '</div>'; // close wrap
            return; // stop rendering view
        } else if ($status_data && isset($status_data['plan'])) {
            $quota = $status_data['plan']['quotaLimit'];
            $used = $status_data['usage']['used'];
            if ($quota !== -1 && $used >= $quota) {
                echo '<div class="lc-banner lc-banner-danger" role="alert"><p><strong>' . esc_html__('Quota Exceeded:', 'leadcop') . '</strong> ' . esc_html__('You have reached your validation limit. Forms are unprotected. Please upgrade your plan in the dashboard.', 'leadcop') . '</p></div>';
            }
        } else if (!$status_data) {
            echo '<div class="lc-banner lc-banner-warning" role="alert"><p><strong>' . esc_html__('Backend Unreachable:', 'leadcop') . '</strong> ' . esc_html__('Unable to fetch latest status from LeadCop servers.', 'leadcop') . '</p></div>';
        }

        // Include View
        include LEADCOP_PLUGIN_DIR . 'admin/views/' . $view_file;
        
        echo '</div>';
    }

    public function render_overview() { $this->render_wrapper('view-overview.php'); }
    public function render_connection() { $this->render_wrapper('view-connection.php'); }
    public function render_usage() { $this->render_wrapper('view-usage.php'); }
    public function render_integrations() { $this->render_wrapper('view-integrations.php'); }
    public function render_settings() { $this->render_wrapper('view-settings.php'); }
    public function render_docs() { $this->render_wrapper('view-documentation.php'); }

    // --- AJAX Handlers ---

    public function ajax_verify_connection() {
        check_ajax_referer('leadcop_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_die();

        $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
        
        if (empty($api_key)) {
            wp_send_json_error(array('message' => esc_html__('API Key is required.', 'leadcop')));
        }

        $result = $this->api->connect($api_key);
        
        if ($result['success']) {
            wp_send_json_success(array('message' => esc_html__('Connected successfully!', 'leadcop')));
        } else {
            wp_send_json_error(array('message' => $result['error']));
        }
    }

    public function ajax_disconnect() {
        check_ajax_referer('leadcop_admin_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_die();
        
        $this->api->disconnect();
        wp_send_json_success(array('message' => esc_html__('Disconnected successfully.', 'leadcop')));
    }
}
