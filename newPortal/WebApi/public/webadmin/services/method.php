<?php
Class Demo
{
    public function __construct() {
        $usersArray = array(
                            array('username' => 'laxmi',     'password' => '123456', 'SSOToken' => 'ABC123'),
                            array('username' => 'raju',      'password' => '123456', 'SSOToken' => 'ABC123'),
                            array('username' => 'vikash',    'password' => '123456', 'SSOToken' => 'ABC123'),
                            array('username' => 'arpit',     'password' => '123456', 'SSOToken' => 'ABC123'),
                            array('username' => 'gate6',     'password' => '123456', 'SSOToken' => 'ABC123'),
                            array('username' => 'gatesix',   'password' => '123456', 'SSOToken' => 'ABC123'),
                            array('username' => 'admin',     'password' => '123456', 'SSOToken' => 'ABC123')
                    );
        $this->usersArray = $usersArray;
	    $postdata = file_get_contents("php://input");
	    $_POST = (array)json_decode($postdata);
    }
    
    public function login()
    {
        $userName = (isset($_POST['UserName']) && !empty($_POST['UserName'])) ? $_POST['UserName'] : '';
        $password = (isset($_POST['Password']) && !empty($_POST['Password'])) ? $_POST['Password'] : '';
        $dataObj = array('username' => $userName, 'password' => $password);
		
		$searchedData = array_filter($this->usersArray, function($userArray) use ($dataObj){
				return ($userArray['username'] == $dataObj['username'] && $userArray['password'] == $dataObj['password']);
			});	
        if(isset($searchedData) && !empty($searchedData))
        {
			$arrayKey = array_keys($searchedData);
            echo self::global_message(200, $searchedData[$arrayKey[0]]);
            exit;
        }else{
            echo self::global_message(201);
            exit;
        }
    }
	

    function signup()
    {
        $name = (isset($_POST['name'])) ? $_POST['name'] : '';
        $username = (isset($_POST['username'])) ? $_POST['username'] : '';
        $password = (isset($_POST['password'])) ? $_POST['password'] : '';
        if(!empty($name) && !empty($username) && !empty($password))
        {
            $dataObj = array('name' => $name, 'username' => $username, 'password' => $password);
            echo self::global_message(200, $dataObj);
            exit;
        }else{
            echo self::global_message(202);
            exit;
       }
    }
	
	function forgotPassword()
	{
        $username = (isset($_POST['username']) && !empty($_POST['username'])) ? $_POST['username'] : '';
		
		$searchedData = array_filter($this->usersArray, function($userArray) use ($username){
				return ($userArray['username'] == $username);
			});	
        if(isset($searchedData) && !empty($searchedData))
        {
            echo self::global_message(200, 'Thanks for your request. \n An email has been send to your email with page link where you can change your password.');
            exit;
        }else{
            echo self::global_message(203);
            exit;
        }
	}
    
    function methodNotExits()
    {
        echo self::global_message(201, 'ok');
				exit;
    }
    
    function global_message($status, $data=false)
	{
		$msg = self::global_message_code($status);
		if($status==200){
			$result = array('Status'=>$status, 'msg'=> $msg, 'data' => $data);
		}else{
            $Message = array('Message' => $msg);
			$result = array('Status'=>$status, 'Error' => $Message);
		}
		return json_encode($result);
	}


	function global_message_code($code)
	{
		$messageArray = array(
			200 => 'success',
            201 => 'Invalid credentials!',
            202 => 'Please fill all fields!',
			203 => 'Invalid username! Please try with another.',
			404 => 'Not Found',
            500 => ' Internal Server Error'
		);
		if(isset($code) && !empty($code)){
			return $messageArray[$code];
		}
		return array();
	}


}

?>