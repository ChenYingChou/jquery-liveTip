<?php
//session_cache_limiter('nocache');     // nocache,private,private_no_expire,publice

$datetime = date('Y-m-d H:i:s');
$node = htmlspecialchars($_REQUEST['node']);
$value = htmlspecialchars($_REQUEST['value']);
$imgs = array(
        "cRm1bCj", "Wiq19LF", "BJStvXc", "HyVmv4Q", "zRMwTyb", "eCW2p5L",
        "4LYFGfg", "kJnR2ZC", "zkToIWW", "AQAehMg", "sNAV7DF", "c8iElky",
        "vCw3Fkc", "MxXaTPG"
    );
$images = '';
foreach ($imgs as $v) {
    $images .= "\t<img width=\"64\" height=\"64\" src=\"//i.imgur.com/{$v}.jpg\">";
}

echo <<<__EOT__
<h1>Server Time is ${datetime}</h1>
<h2>node={$node} value={$value}</h2>
<div style="min-width:136px;max-width:340px;">
${images}
</div>
__EOT__;
