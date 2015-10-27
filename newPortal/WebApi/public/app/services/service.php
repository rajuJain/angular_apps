<?php

require_once('method.php');
$demoObj = new Demo();



$requestMethod = (isset($_GET['requestMethod'])) ? $_GET['requestMethod'] :'';
$requestMethod = strtolower(trim(str_replace("/","",$requestMethod)));

if(!empty($requestMethod))
{
    if(method_exists($demoObj, $requestMethod))
    {
        $demoObj->$requestMethod();
    }else{
        $demoObj->methodNotExits();	
    }
}else{
    $demoObj->methodNotFound();
}

?>