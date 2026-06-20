<?php if (!defined('ABSPATH')) exit; ?>
<div class="lc-wizard">
    <div class="lc-card">
        <h2><?php esc_html_e('Connect LeadCop', 'leadcop'); ?></h2>
        <p><?php esc_html_e('To activate LeadCop form protection on this website, you need an API key.', 'leadcop'); ?></p>
        
        <div class="lc-wizard-steps">
            <ol>
                <li><?php printf(wp_kses_post(__('Log in to your <a href="%s" target="_blank">LeadCop Dashboard</a>', 'leadcop')), 'https://app.leadcop.io/dashboard'); ?></li>
                <li><?php esc_html_e('Go to API Keys and create a new key', 'leadcop'); ?></li>
                <li><?php esc_html_e('Copy the API Key and paste it below', 'leadcop'); ?></li>
            </ol>
        </div>

        <form id="lc-connect-form" aria-label="<?php esc_attr_e('LeadCop Connection Form', 'leadcop'); ?>">
            <div id="lc-connect-msg" aria-live="polite"></div>
            <div style="margin-bottom: 20px;">
                <label for="lc-api-key" class="screen-reader-text"><?php esc_html_e('API Key', 'leadcop'); ?></label>
                <input type="text" id="lc-api-key" name="api_key" class="lc-input" placeholder="<?php esc_attr_e('lc_pub_...', 'leadcop'); ?>" value="<?php echo esc_attr($this->api->is_connected() ? '********' : ''); ?>" autocomplete="off" aria-required="true" />
            </div>
            <button type="submit" id="lc-connect-btn" class="lc-btn"><?php esc_html_e('Connect LeadCop', 'leadcop'); ?></button>
        </form>
    </div>
</div>
