<?php
use \ForceUTF8\Encoding;

class manager
{
	private $zillow_api;

    private $serverName = "wayne90103.ipagemysql.com";
    private $connectionOptions = array(
                "Database" => "ss_dbname_castre1",
                "Uid" => "wayne",
                "PWD" => "annie10",
                "CharacterSet" => "UTF-8"
            );
    public function __construct()
    {
		require_once('zillow_api.php');
        $this->zillow_api = new Zillow_Api('X1-ZWz1fg4xc5pgjv_7nbg7');
    }
    public function addAddressToDB($address,$locality,$state){
	$result = -1;
	$conn = new mysqli($this->serverName, $this->connectionOptions['Uid'], $this->connectionOptions['PWD']);
	if ($conn->connect_error) {
    		die("Connection failed: " . $conn->connect_error);
	}
	$sql = "INSERT INTO ss_dbname_castre1.addresses (address,locality,state) VALUES ('$address','$locality','$state')";
	if ($conn->query($sql) === TRUE) {
    		$result = 1;
	} else {
    		echo "Error: " . $sql . "<br>" . $conn->error;
	}
	$last_id = mysqli_insert_id($conn); 
	
	$conn->close();
        
        return $last_id;
    }
    public function removeAddressFromDB($id){
	$result = -1;
	$conn = new mysqli($this->serverName, $this->connectionOptions['Uid'], $this->connectionOptions['PWD']);
	if ($conn->connect_error) {
    		die("Connection failed: " . $conn->connect_error);
	}

	$sql = "DELETE FROM ss_dbname_castre1.addresses WHERE id='$id'";
	if ($conn->query($sql) === TRUE) {
    		$result = 1;
	} else {
    		echo "Error: " . $sql . "<br>" . $conn->error;
	}

	$conn->close();
        
        return $result;
    }
    public function getAllAddressesFromDB(){
	$result = -1;
	$json = array();
	$conn = new mysqli($this->serverName, $this->connectionOptions['Uid'], $this->connectionOptions['PWD']);
	if ($conn->connect_error) {
    		die("Connection failed: " . $conn->connect_error);
	}

	$sql = "SELECT * FROM ss_dbname_castre1.addresses";
	$result = $conn->query($sql);
	while($row = $result->fetch_assoc()){
        	$bus = array(
                    'id' => $row['id'],
                    'address' => $row['address'],
                    'locality' => $row['locality'],
                    'state' => $row['state']		    
                );
                array_push($json, $bus);
        }
	
	$conn->close();
        
        $jsonstring = json_encode($json);
        return $jsonstring;
	}
	public function xml_request($requesturl, $connect_time = 120)
    {
        $URL = $requesturl;
        
        $ch = curl_init();
        //curl_setopt($ch, CURLOPT_POST, 1);
        //curl_setopt($ch, CURLOPT_PROXY, $this->proxy);
        //curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $connect_time);
        //curl_setopt($ch, CURLOPT_TIMEOUT, $connect_time);
        //curl_setopt($ch, CURLOPT_POSTFIELDS, "$xmldata");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $URL);
		
        $output = curl_exec($ch);

        curl_close($ch);
        
        return $output;
    }
	public function getZPID($address,$citystate){
		$result = "-1";
		$result = $this->zillow_api->GetSearchResults(array('address' => $address, 'citystatezip' => $citystate));
		
		
		return $result;
	}
	public function getData($zpid){
		$result = "-1";
		$result = $this->zillow_api->GetDeepComps($zpid);

		return $result;
	}
}
?>