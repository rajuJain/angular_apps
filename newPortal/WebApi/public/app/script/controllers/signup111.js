'use strict';

/* Signup Controller Logic*/

angular.module('AngularDemo')

     /**
    * @ngdoc
    * @name AngularDemo.Controller:homeController
    * @url '/'
    * @template home.html
    * @description
    * display user home page
    */
    .controller('signupController', ['$scope', '$validator', '$q', 'serviceData','$location','serviceAuth', function ($scope, $validator, $q, serviceData, $location, serviceAuth) {
        //jQuery time
        $scope.showSubmit = false;
        $scope.userData = {};
        $scope.strength = null;
        $scope.validation_err = null;
        $(document).keydown(function(objEvent) {
            if (objEvent.keyCode == 9) {  //tab pressed
                objEvent.preventDefault(); // stops its action
            }
        })
        $(document).ready(function(){
          //Next button on slide 1 clicked
            $("#btn1").click(function(){
                $scope.errorMsg = "Please fill first & last";
                // Slide 1 moves out

                var firstName = $('input[name=firstName]').val();
                var firstName = firstName.trim();
                var check =  /^[a-z0-9_]+$/i.test(firstName);

                if (firstName === undefined || firstName == "") {
                    $('.validation_error').fadeIn(1000)
                    $('.validation_error p').html("Please enter your first and last name")
                    return false;
                };

                if (check == true || !firstName) {
                    $('.validation_error').fadeIn(1000)
                    $('.validation_error p').html("Please enter your first and last name")
                    return false;
                };

                if (firstName) {
                    $('.validation_error').fadeOut(1000)
                    $('.validation_error p').html("")
                };
                $("#slide1").removeClass('slide1in');
                $("#slide1").addClass('slide1out');
                $("#btn1").removeClass('btn1show');
                $("#btn1").addClass('btn1hide');
                
                // Slide 2 moves in
                $("#slide2").removeClass('slide2parked');
                $("#slide2").addClass('slide2in');
                $("#btn2").removeClass('btn2hide');
                $("#btn2").addClass('btn2show');
         })
         
         //Next button on slide 2 clicked
            $("#btn2").click(function(){
                var email = $('input[name=email]').val();
                if (email === undefined || email == "") {
                    $('.validation_error').fadeIn(1000)
                    $('.validation_error p').html("Please enter a valid email address")
                    return false;
                };

                if (email) {
                    var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                    var check = re.test(email);
                    if (check == false) {
                        $('.validation_error').fadeIn(1000)
                        $('.validation_error p').html("Please enter a valid email address");
                        return false;
                    };

                    $('.validation_error').fadeOut(1000)
                    $('.validation_error p').html("")
                };

                //Slide 2 moves out
                $("#slide2").removeClass('slide2in');
                $("#slide2").addClass('slide2out');
                $("#btn2").removeClass('btn2show');
                $("#btn2").addClass('btn2hide');
                
                //Slide 3 moves in
                $("#slide3").removeClass('slide2parked');
                $("#slide3").addClass('slide3in');
                $("#btn3").removeClass('btn3hide');
                $("#btn3").addClass('btn3show');
         })
         
         //Next button on slide 3 clicked
            $("#btn3").click(function(){
                //Slide 2 moves out
                $("#slide2").removeClass('slide2in');
                $("#slide2").addClass('slide2out');
                $("#btn2").removeClass('btn2show');
                $("#btn2").addClass('btn2hide');
                
                //Slide 3 moves in
                $("#slide3").removeClass('slide2parked');
                $("#slide3").addClass('slide3in');
                $("#btn3").removeClass('btn3hide');
                $("#btn3").addClass('btn3show');
         })
          
         })

        $scope.signup = function(userData){
            if ($scope.strength != "Good" && $scope.strength != "Strong") {
                $scope.errorMsg = "password";
                $('.validation_error').fadeIn(1000)
                $('.validation_error p').html("Password weak! Password gets green when strong");
                return false;
            };
            $scope.signupSuccessMessage = '';
            $scope.errorMsg = '';
            var Name = userData.firstName.split(" ");
            userData.firstName = Name[0];
            userData.lastName = Name[1];
            serviceData.send('signup', {first_name: userData.firstName, last_name: userData.lastName, email: userData.email, password: userData.password}).then(function (response) {
                if (response.response_code == 200 && !response.error_code) {
                       console.log(response);
                       $scope.userData = {};
                       // window.location.href = "http://northout.com/learnluxm/goals.html";
                       var credentials = response.result;
                       $scope.signupSuccessMessage = 'You are successfully registered with us!';
                        var dataJSON = {email: userData.email, password: userData.password};
                        serviceAuth.login(dataJSON).then(function (resp) {
                            if (resp.response_code == 200 && !resp.error_code) {
                                $location.path('financialGoals');
                            }else{
                                alert("Invalid Login");
                            }                        
                        })
                }else{
                    if (response.error_code && response.error_text) {
                        console.log("ERROR",response);
                            $('.validation_error').fadeIn(1000);
                            $('.validation_error').html(response.error_text);
                        /*if (response.error_text) {
                            // $scope.errorMsg = response.error_text;
                        };*/
                    }
                    
                }
            },function(error){
                $scope.errorMsg = "Connected but received a server error in response: " + error.status;
            });  
        }

        $scope.checkPassStrength = function(password) {
            //initial strength
            var strength = 0;
            //if the password length is less than 6, return message.
            if (password != null) {
                if (password.length < 6) { 
                    $scope.strength = "Too Short!"    
                    $scope.color = "red" 
                    $scope.showSubmit = false;
                    return null; 
                }
            };
            
            //length is ok, lets continue.
            
            //if length is 8 characters or more, increase strength value
            if (password.length > 7) strength += 1
            
            //if password contains both lower and uppercase characters, increase strength value
            if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))  strength += 1
            
            //if it has numbers and characters, increase strength value
            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))  strength += 1 
            
            //if it has one special character, increase strength value
            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))  strength += 1
            
            //if it has two special characters, increase strength value
            if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
            
            //now we have calculated strength value, we can return messages
            
            //if value is less than 2
            if (strength < 2 ) {
                $scope.strength = "Weak";           
                $scope.color = "red"         
                $('.validation_error').fadeIn(1000);
                $('.validation_error').html("Password weak! Password gets green when strong");
                $scope.showSubmit = false;                  
            }else if (strength == 2 ) {          
                $('.validation_error').fadeOut(1000);
                $('.validation_error').html("");
                $scope.strength = "Good";           
                $scope.color = "yellow"         
                $scope.showSubmit = true;         
            }else{
                $('.validation_error').fadeOut(1000);
                $('.validation_error').html("");
                $scope.strength = "Strong";
                $scope.color = "green"         
                $scope.showSubmit = true;         
            }
        }
    }])
    
    
    
    .controller('forgotPassowrdController', ['$scope', '$validator', '$q', 'serviceData', '$location', function ($scope, $validator, $q, serviceData, $location) {
        
        $scope.userData = {};
        $scope.forgorpassword = function(userData){
            $scope.forgotSuccessMessage = '';
            $scope.errorMsg = '';
            
            serviceData.get('forgot', {email: userData.email}).then(function (response) {
                if (response.response_code == 200 && !response.error_code) {
                       $scope.userData = {};
                       $scope.signupSuccessMessage = 'You are successfully registered with us!';
                       $location.path('/login');
                }else{
                    if (response.error_code && response.error_text) {
                        $scope.errorMsg = response.error_text;
                    }
                    
                }
            },function(error){
                $scope.errorMsg = "Connected but received a server error in response: " + error.status;
            });  
        }
    }])

    .controller('financialGoalsController', ['$scope', '$validator', 'serviceData','serviceAuth','$location', function ($scope, $validator, serviceData, serviceAuth, $location){
        $scope.results = [];
        serviceData.get('getFinancialGoalsQues',{}).then(function (response) {
            if (response.response_code == 200 && !response.error_code) {
                for (var i = 0; i < response.data.length; i++) {
                    response.data[i]['QUS_ID'] = response.data[i]['ID'];
                };
                $scope.results = response.data;
            }else{
                alert(response.error_text);
            }
        },function(error){
            $scope.errorMsg = "Connected but received a server error in response: " + error.status;
        });



        $scope.submitFinGoals = function(res, sessionData) {
            if (res.length > 0) {
                console.log(res);
                serviceData.send('submitFinGoals', {userData: sessionData, financialGoals: res}).then(function (response) {
                    alert("checking!!!")
                    if (response.response_code == 200 && !response.error_code) {
                        console.log(response);
                        $location.path("/Dashboard");
                       /* var Qids = new Array();
                        for (var i = 0; i < res.length; i++) {
                            Qids[i] = res[i].QUS_ID;
                        };
                        console.log(Qids);*/
                        /*serviceData.send('userFinGoals',{userData:sessionData, Qusid:Qids }).then(
                            function(resp){
                                if (resp.error_code) {
                                    alert("Not Found")   
                                }else{
                                    var goals = resp.data;
                                    console.log("resp.dat", goals);
                                    // $location.path('/goalsView').search(goals);
                                    $location.path("/Dashboard");
                                }
                            }
                        )*/
                    }else{
                        console.log(response);
                        if (response.error_text == "GOALS_ALREADY_INSERTED") {
                            alert('Seems like you have already have your financial goals');
                            $location.path("/");
                        }else{
                            alert('something went wrong!!');
                        }
                    }
                },function(error){
                    $scope.errorMsg = "Connected but received a server error in response: " + error.status;
                });   
            }
        }

        //function for changing slides ..
        $scope.widthArr = [];
        $scope.selectedIndexes = [];
        $scope.selectedResults = [];
        $scope.changeslides = function(index, result, results, Ans) {
            // alert("checking!!!");
            // alert(index);
            var total = 0;
            for( var i in results) {
                total = total + results[i].DEFAULT_AMOUNT;
            }
            if (index >= 0) {
                var prev_index = index - 1;
                var next_index = index + 1;
                $("#Band"+index).removeClass("band");
                if (Ans == "Yes") {
                    $scope.selectedIndexes.push(index); 
                    $scope.selectedResults.push(result); 
                    //calculating the width percentage here..
                    var widthPercentage = (result.DEFAULT_AMOUNT/total)*100;
                    $scope.widthArr.push(widthPercentage);
                    // console.log("ARR", $scope.widthArr);
                    var totalWidth = 0;
                    jQuery.each($scope.widthArr, function(z ,widthArrValue){
                        totalWidth = totalWidth + widthArrValue;
                    })

                    totalWidth = 100-totalWidth;
                    var css = {
                        '-webkit-transform': 'translate(-'+totalWidth+'%, 0%)',
                        '-moz-transform': 'translate('+totalWidth+'%, 0%)',
                        '-o-transform': 'translate('+totalWidth+'%, 0%)',
                        '-ms-transform': 'translate('+totalWidth+'%, 0%)',
                        'transform': 'translate(-'+totalWidth+'%, 0%)'
                    }
                    // Band moves in
                    // alert("Yes");
                    $("#Band"+index).addClass('bandYes');
                    $('#Band'+index).css(css);
                }else{
                    // Band moves in;
                    // alert("No");
                    $("#Band"+index).addClass('bandNo');
                }
                
                // Slie moves out
                $("#goal"+index).removeClass('goal1in');
                $("#goal"+index).addClass('goalout');

                // Next Slide  moves in
                $("#goal"+prev_index).removeClass('goalparked');
                $("#goal"+prev_index).addClass('goalin');

            };

            if (index == 0) {
                var selectedTotal = 0;
                angular.forEach($scope.selectedResults, function(resValue, resKey) {
                    selectedTotal = selectedTotal + resValue.DEFAULT_AMOUNT;
                });
                // console.log("selectedTotal",selectedTotal);
                // console.log("TOTAL",selectedTotal);
                var selectedPercentages = 0;
                var t =0;
                var selectedPercentagesShow = 0;
                angular.forEach($scope.selectedResults, function(resultValue, resultKey){
                    // console.log(resultValue.DEFAULT_AMOUNT);
                    selectedPercentages = (resultValue.DEFAULT_AMOUNT/selectedTotal)*100;
                    selectedPercentagesShow = selectedPercentagesShow + selectedPercentages
                    var newTotal = 100 - selectedPercentagesShow;
                    var Newcss = {
                            '-webkit-transform': 'translate(-'+newTotal+'%, 0%)',
                            '-moz-transform': 'translate('+newTotal+'%, 0%)',
                            '-o-transform': 'translate('+newTotal+'%, 0%)',
                            '-ms-transform': 'translate('+newTotal+'%, 0%)',
                            'transform': 'translate(-'+newTotal+'%, 0%)'
                        }
                    // console.log('VALUE',Newcss);
                    // console.log($scope.selectedIndexes[resultKey])
                    $("#Band"+$scope.selectedIndexes[resultKey]).addClass('bandYes');
                    $("#Band"+$scope.selectedIndexes[resultKey]).css(Newcss);
                })


                // console.log(selectedTotal);
                $('#submitSlide').removeClass('goalparked');
                $('#submitSlide').addClass('goalin');
                // alert("Submit slide");
            };
        } 

    }])

    .controller('goalsViewController', ['$scope','$routeParams', '$validator', 'serviceData','serviceAuth','$location',function($scope, $routeParams,  $validator, serviceData, serviceAuth, $location){
            console.log("routeParams", $routeParams);
            var objs = new Array();
            var goals = $routeParams
            for(var i in goals){
              objs[i] = goals[i]
            }
            
            var total = 0;
            for(var i=0; i < objs.length; i++){
                total = total+objs[i].UPDATED_AMOUNT;
            }
            var html = '',bckground='-webkit-linear-gradient( left,',bandWidth = 0,stopWidth=0;
            for(var z=0; z < objs.length; z++){
                var width = ((objs[z].UPDATED_AMOUNT/total)*100);
                objs[z].width = width;
                stopWidth = stopWidth+width;
                if(z==0)
                    bckground = bckground + objs[z].COLOR+' '+'0%, '+ objs[z].COLOR+' '+width+'%'; 
                else{
                    bckground = bckground + objs[z].COLOR+' '+bandWidth+'%, '+ objs[z].COLOR+' '+stopWidth+'%';
                    }   
                bandWidth = bandWidth+width;
                if(z!=objs.length-1){
                    bckground = bckground +',';
                }else{
                    bckground = bckground +')';
                }
                
            }
            console.log(bckground);
            $('#containerColors').css('background',bckground);
            // return html;
        }
    ])
