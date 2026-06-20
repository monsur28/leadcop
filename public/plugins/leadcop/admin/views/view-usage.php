<?php 
if (!defined('ABSPATH')) exit; 
$status = $this->api->get_status();
if (!$status) return;

$metrics = $status['metrics'];
?>

<div class="lc-header">
    <h2><?php esc_html_e('Usage Metrics', 'leadcop'); ?></h2>
</div>

<div class="lc-grid">
    <div class="lc-card">
        <h3><?php esc_html_e('Total Validations (30 Days)', 'leadcop'); ?></h3>
        <p class="lc-metric"><?php echo esc_html(number_format_i18n($metrics['totalChecked'])); ?></p>
    </div>
    
    <div class="lc-card">
        <h3><?php esc_html_e('Blocked Disposable', 'leadcop'); ?></h3>
        <p class="lc-metric" style="color: var(--lc-danger);"><?php echo esc_html(number_format_i18n($metrics['blockedDisposable'])); ?></p>
    </div>

    <div class="lc-card">
        <h3><?php esc_html_e('Blocked Role Accounts', 'leadcop'); ?></h3>
        <p class="lc-metric" style="color: var(--lc-warning);"><?php echo esc_html(number_format_i18n($metrics['blockedRole'])); ?></p>
    </div>
</div>
