<?php
//session_cache_limiter('nocache');     // nocache,private,private_no_expire,publice

$datetime = date('Y-m-d H:i:s');
$node = htmlspecialchars($_REQUEST['node']);
$value = htmlspecialchars($_REQUEST['value']);
$imgs = array('dll','doc','htm','mp3','mpeg','pdf','psd','rar','rm','swf','txt','xls','xml','zip');
$images = '';
for ($i = 0; $i < count($imgs); $i++) {
	$v = $imgs[$i];
	$images .= "\t<img width=\"64\" height=\"64\" src=\"http://dl.dropbox.com/u/3232178/icons/icon-{$v}.jpg\" />";
}

echo <<<__EOT__
<h1>Server Time is ${datetime}</h1>
<h2>node={$node} value={$value}</h2>
<div style="min-width:136px;max-width:340px;">
${images}
</div>
__EOT__;

?>
