<?php 
if (!defined('ABSPATH')) exit; 
$status = $this->api->get_status();
if (!$status) return;
?>

<div class="lc-header">
    <h2><?php esc_html_e('LeadCop Settings', 'leadcop'); ?></h2>
</div>

<div class="lc-card" style="max-width: 600px;">
    <h3><?php esc_html_e('API Connection', 'leadcop'); ?></h3>
    <p style="color: var(--lc-gray-600); margin-bottom: 20px;"><?php esc_html_e('Your API key is currently active. Disconnecting will stop form protection on this website.', 'leadcop'); ?></p>
    
    <div style="margin-bottom: 20px;">
        <label for="lc-api-key-disabled" style="display: block; font-weight: 600; margin-bottom: 8px;"><?php esc_html_e('API Key', 'leadcop'); ?></label>
        <input type="text" id="lc-api-key-disabled" class="lc-input" value="••••••••••••••••••••••••" disabled aria-disabled="true" />
    </div>

    <button id="lc-disconnect-btn" class="lc-btn lc-btn-secondary" style="color: var(--lc-danger); border-color: var(--lc-danger);"><?php esc_html_e('Disconnect LeadCop', 'leadcop'); ?></button>
</div>
