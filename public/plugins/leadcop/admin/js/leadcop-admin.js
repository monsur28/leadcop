jQuery(document).ready(function($) {
    
    // Connection Wizard
    $('#lc-connect-form').on('submit', function(e) {
        e.preventDefault();
        
        var apiKey = $('#lc-api-key').val();
        var $btn = $('#lc-connect-btn');
        var $msg = $('#lc-connect-msg');
        
        if (!apiKey) {
            $msg.html('<div class="lc-banner lc-banner-danger" role="alert"><p>' + leadcop_ajax.i18n.enterKey + '</p></div>');
            return;
        }

        $btn.prop('disabled', true).text(leadcop_ajax.i18n.connecting);
        $msg.html('');

        $.ajax({
            url: leadcop_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'leadcop_verify_connection',
                nonce: leadcop_ajax.nonce,
                api_key: apiKey
            },
            success: function(response) {
                if (response.success) {
                    $msg.html('<div class="lc-banner lc-banner-success" role="alert"><p>' + leadcop_ajax.i18n.connected + '</p></div>');
                    setTimeout(function() {
                        window.location.href = '?page=leadcop-overview';
                    }, 1000);
                } else {
                    $msg.html('<div class="lc-banner lc-banner-danger" role="alert"><p>' + response.data.message + '</p></div>');
                    $btn.prop('disabled', false).text(leadcop_ajax.i18n.connectBtn);
                }
            },
            error: function() {
                $msg.html('<div class="lc-banner lc-banner-danger" role="alert"><p>' + leadcop_ajax.i18n.networkError + '</p></div>');
                $btn.prop('disabled', false).text(leadcop_ajax.i18n.connectBtn);
            }
        });
    });

    // Disconnect Button
    $('#lc-disconnect-btn').on('click', function(e) {
        e.preventDefault();
        if (!confirm(leadcop_ajax.i18n.confirmDisconnect)) {
            return;
        }

        var $btn = $(this);
        $btn.text(leadcop_ajax.i18n.disconnecting);

        $.ajax({
            url: leadcop_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'leadcop_disconnect',
                nonce: leadcop_ajax.nonce
            },
            success: function(response) {
                window.location.href = '?page=leadcop-connection';
            }
        });
    });

});
