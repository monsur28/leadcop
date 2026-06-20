<?php 
if (!defined('ABSPATH')) exit; 
$status = $this->api->get_status();
if (!$status) return;

$integrations = array(
    array('name' => 'Contact Form 7', 'func' => 'wpcf7_plugin_path'),
    array('name' => 'WPForms', 'func' => 'wpforms'),
    array('name' => 'Gravity Forms', 'class' => 'GFForms'),
    array('name' => 'Elementor Pro', 'class' => 'ElementorPro\Plugin'),
    array('name' => 'Ninja Forms', 'class' => 'Ninja_Forms'),
    array('name' => 'WooCommerce', 'class' => 'WooCommerce')
);
?>

<div class="lc-header">
    <h2><?php esc_html_e('Integrations', 'leadcop'); ?></h2>
</div>

<div class="lc-card">
    <p style="margin-top: 0; color: var(--lc-gray-600);"><?php esc_html_e('LeadCop automatically detects and protects supported form plugins.', 'leadcop'); ?></p>
    
    <table class="lc-table" style="margin-top: 20px;" aria-label="<?php esc_attr_e('Form Plugin Integrations', 'leadcop'); ?>">
        <thead>
            <tr>
                <th scope="col"><?php esc_html_e('Plugin Name', 'leadcop'); ?></th>
                <th scope="col"><?php esc_html_e('Status', 'leadcop'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($integrations as $int): 
                $active = false;
                if (isset($int['func']) && function_exists($int['func'])) $active = true;
                if (isset($int['class']) && class_exists($int['class'])) $active = true;
            ?>
                <tr>
                    <td><strong><?php echo esc_html($int['name']); ?></strong></td>
                    <td>
                        <?php if ($active): ?>
                            <span class="lc-badge lc-badge-success"><?php esc_html_e('Protected', 'leadcop'); ?></span>
                        <?php else: ?>
                            <span style="color: var(--lc-gray-300);"><?php esc_html_e('Not Installed', 'leadcop'); ?></span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
