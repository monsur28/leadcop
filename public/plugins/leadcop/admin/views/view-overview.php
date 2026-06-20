<?php 
if (!defined('ABSPATH')) exit; 
$status = $this->api->get_status();
if (!$status) return;

$plan = $status['plan'];
$usage = $status['usage'];
$metrics = $status['metrics'];
?>

<div class="lc-header">
    <h2><?php esc_html_e('LeadCop Overview', 'leadcop'); ?></h2>
</div>

<div class="lc-grid">
    <div class="lc-card">
        <h3><?php esc_html_e('Current Plan', 'leadcop'); ?></h3>
        <p class="lc-metric" style="font-size: 24px;"><?php echo esc_html($plan['name']); ?></p>
        <div style="color: var(--lc-gray-600); font-size: 13px; margin-top: 10px;">
            <?php if ($plan['quotaLimit'] === -1): ?>
                <?php esc_html_e('Unlimited Quota', 'leadcop'); ?>
            <?php else: ?>
                <?php printf(esc_html__('%1$s / %2$s Validations', 'leadcop'), number_format($usage['used']), number_format($plan['quotaLimit'])); ?>
                <div class="lc-progress-wrapper" role="progressbar" aria-valuenow="<?php echo esc_attr($usage['percent']); ?>" aria-valuemin="0" aria-valuemax="100">
                    <div class="lc-progress-bar" style="width: <?php echo esc_attr($usage['percent']); ?>%"></div>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <div class="lc-card">
        <h3><?php esc_html_e('Protection Status', 'leadcop'); ?></h3>
        <p class="lc-metric" style="font-size: 24px; color: var(--lc-success);"><?php esc_html_e('Active', 'leadcop'); ?></p>
        <p style="color: var(--lc-gray-600); font-size: 13px; margin-top: 10px;">
            <?php 
            $enforcing = array();
            if ($plan['roleDetection']) $enforcing[] = __('Role Detection', 'leadcop');
            if ($plan['publicDetection']) $enforcing[] = __('Public Detection', 'leadcop');
            $enforcing[] = __('Disposable Blocks', 'leadcop');
            printf(esc_html__('Enforcing %s.', 'leadcop'), implode(', ', $enforcing));
            ?>
        </p>
    </div>

    <div class="lc-card">
        <h3><?php esc_html_e('Validation Success Rate', 'leadcop'); ?></h3>
        <p class="lc-metric"><?php echo esc_html($metrics['successRate']); ?>%</p>
        <p style="color: var(--lc-gray-600); font-size: 13px; margin-top: 10px;"><?php esc_html_e('Over the last 30 days', 'leadcop'); ?></p>
    </div>
</div>

<div class="lc-card" style="margin-top: 20px;">
    <h3><?php esc_html_e('Recent Blocked Submissions', 'leadcop'); ?></h3>
    <?php if (empty($status['recentBlocked'])): ?>
        <p style="color: var(--lc-gray-600); padding: 20px 0; text-align: center;"><?php esc_html_e('No blocked submissions recently.', 'leadcop'); ?></p>
    <?php else: ?>
        <table class="lc-table" aria-label="<?php esc_attr_e('Recent Blocked Submissions', 'leadcop'); ?>">
            <thead>
                <tr>
                    <th scope="col"><?php esc_html_e('Domain', 'leadcop'); ?></th>
                    <th scope="col"><?php esc_html_e('Reason', 'leadcop'); ?></th>
                    <th scope="col"><?php esc_html_e('Date', 'leadcop'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($status['recentBlocked'] as $log): ?>
                    <tr>
                        <td><?php echo esc_html($log['domain']); ?></td>
                        <td>
                            <?php if ($log['reason'] === 'ROLE'): ?>
                                <span class="lc-badge lc-badge-warning"><?php esc_html_e('Role Account', 'leadcop'); ?></span>
                            <?php elseif ($log['reason'] === 'DISPOSABLE'): ?>
                                <span class="lc-badge lc-badge-danger"><?php esc_html_e('Disposable', 'leadcop'); ?></span>
                            <?php else: ?>
                                <span class="lc-badge lc-badge-warning"><?php echo esc_html($log['reason']); ?></span>
                            <?php endif; ?>
                        </td>
                        <td style="color: var(--lc-gray-600);"><?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($log['date']))); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>
