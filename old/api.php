<?php
use \ForceUTF8\Encoding;
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials:true');
header('Access-Control-Allow-Methods:GET,HEAD,OPTIONS,POST,PUT');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type,Access-Control-Allow-Origin, Access-Control-Request-Method, Access-Control-Request-Headers');

session_start();
require_once("manager.php");

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str);
$some = 0;
$response = $json_obj->{'action'};
if ($json_obj->{'action'} == "save") {
    $manager = new manager();
    $address      = $json_obj->{'address'};
    $locality      = $json_obj->{'locality'};
    $state      = $json_obj->{'state'};
    $response = $manager->addAddressToDB($address,$locality,$state);
}
if ($json_obj->{'action'} == "delete") {
    $manager = new manager();
    $id      = $json_obj->{'id'};

    $response = $manager->removeAddressFromDB($id);
}
if ($json_obj->{'action'} == "getzpid") {
    $manager = new manager();
    $locality      = $json_obj->{'locality'};
    $state      = $json_obj->{'state'};

    $response = $manager->getZPID($locality,$state);
}
if ($json_obj->{'action'} == "getzpdata") {
    $manager = new manager();
    $zpid      = $json_obj->{'zpid'};

    $response = $manager->getData($zpid);
}

if ($json_obj->{'action'} == "getall") {
    $manager = new manager();

    $response = $manager->getAllAddressesFromDB();
}
if ($json_obj->{'action'} == "test") {
    $manager = new manager();
    $address      = $json_obj->{'address'};

    $response = "API working";
}
echo $response;
?>