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
    .controller('userSlidesController', ['$scope','$rootScope', '$routeParams', 'serviceData','$location','serviceAuth', function ($scope,$rootScope, $routeParams, serviceData, $location, serviceAuth) {
      // console.log("routeParams",$routeParams);
        $scope.moduleID = $routeParams.moduleID;
        $scope.allData = null;
        $scope.sliderValue = 0;
        $scope.dimensions = 0;
        // $scope.maxAmount = null;
        // $scope.chart_content = null;
        // $scope.interestCompounded = null;
        // $scope.rate = null;
        // $scope.graphReq = null;
        $scope.years =  ['10', '20', '32'];
        
        //get data from api ..
        serviceData.get('getSlides', {module_id: $scope.moduleID}).then(function (response) {
            if (response.response_code == 200 && response.result == "success") {
                $scope.allData = response.data;
                $scope.allData.reverse()
                // console.log("allData",$scope.allData);
            }else{
                alert('Please Login');
                console.log("failure",response);
            }
        },function(error){
            $scope.errorMsg = "Connected but received a server error in response: " + error.status;
        });
        
        //getting last year form year object

        //getting data of circulr chart
        $scope.circularChart = function(data) {
          $scope.circularData = angular.fromJson(data.CONTENT);
          // console.log($scope.circularData);
        }

        $scope.getChartData = function(response) {
          //to be used
        }

        $scope.showChart = function(dimensions, ordering, percentage) {      
          setTimeout(function(){

            $scope.dimensions = $scope.dimensions+25;
             $("#c-box"+ordering).css({"top": String($scope.dimensions)+"px", "left": String($scope.dimensions)+"px"});

            // $("#inp").attr({"data-width": "500px", "data-height":"500px"});

         }, 5);

          var kdimension = (500-(ordering+1)*50);
          $(function($) {
              $('.knob').attr("value",percentage.percentage);
              $(".knob").knob({
                'width':kdimension,
                'height':kdimension,
                'fgColor':percentage.color,
                'fgColorMid':percentage.color,
                'fgColorEnd':percentage.color
              }); 
          });
        }
        
        // console.log(lastYear);
        
        //arrange data for dual text template..
        $scope.dualTextTemp = function(data) {
          $scope.dataContent = angular.fromJson(data.CONTENT);
        }

        //arrange data for single text centered template..
        $scope.singleTextCentered = function(data) {
          $scope.dataSingleCeneteredContent = angular.fromJson(data.CONTENT);
        }

        //arrange data for single text template..
        $scope.singleText = function(data) {
          $scope.dataSingleText = angular.fromJson(data.CONTENT);
        }

        $scope.hexaGraph = function(data) {
          $scope.hexaGraphData = angular.fromJson(data.CONTENT);
          // console.log("Hexa",$scope.dataSingleCeneteredContent);
          // console.log("Data",$scope.dataContent);
        }        

        $scope.nextSlide = function(index) {
          console.log(index);
          if (index == 0) {
            $location.path("/saveModule/"+$scope.moduleID);
          }else{
            $('#slide'+index).removeClass("graphDesc");
            $('#slide'+index).addClass("graphDesc1");
          }
        }

        $scope.changeValue = function(response, sliderValue) {
            $rootScope.popupData = null;
            $scope.simpleInterest = [];
            $scope.compoundInterest = [];
            $scope.chart_content = response.CONTENT;
            $scope.chart_content = angular.fromJson($scope.chart_content);
            $rootScope.popupData = $scope.chart_content.CONTENT.POPJSON;
            console.log("Content::",$scope.chart_content);
           
            // console.log("chart_content",$scope.chart_content)
            $scope.graphReq = $scope.chart_content.CONTENT.GRAPH_JSON;
            $scope.minAmount = Number($scope.graphReq.AMOUNT_MIN);
            // $scope.sliderValue = Number($scope.graphReq.AMOUNT_MIN);
            $scope.maxAmount = Number($scope.graphReq.AMOUNT_MAX);
            $scope.rate =  Number($scope.graphReq.RATE);
            $scope.years = $scope.graphReq.TIME;
            $scope.interestCompounded = Number($scope.graphReq.INTEREST_COMPOUNDED);
          
            // var lastYear = $scope.years.pop();
            var lastYear = $scope.years.slice(-1)[0]
            angular.forEach($scope.years, function(yearVal, yearIndex){
               //logic for simple interest..
               var si_formula = null;
               if (!$scope.chart_content) {
                  console.log("");
               }else{
                  //logic for simple interest//
                  var time = $scope.graphReq.TIME
                  si_formula =  $scope.chart_content.CONTENT.GRAPH1_FORMULA;
                  si_formula = si_formula.replace("P", sliderValue);
                  si_formula = si_formula.replace("R", $scope.rate);
                  si_formula = si_formula.replace("T", yearVal);
                  // console.log("sliderValue",sliderValue);
                  
                  var singleSi = eval(si_formula);
                  singleSi = Math.round(singleSi);
                  // console.log(singleSi);
                  $scope.simpleInterest.push(singleSi);
                  // console.log("simpleInterest",$scope.simpleInterest);
                  // console.log(sliderValue);

                  //logic for compound interest..
                  var formula = $scope.chart_content.CONTENT.GRAPH2_FORMULA.formula;
                  var power = $scope.chart_content.CONTENT.GRAPH2_FORMULA.power;
                  var rate_compound_interst = $scope.rate/100;
                  formula = formula.replace("R", rate_compound_interst);
                  formula = formula.replace("N", $scope.interestCompounded);
                  formula = eval(formula);

                  power = power.replace("N", $scope.interestCompounded);
                  power = power.replace("T", yearVal);
                  power = eval(power);
                  
                  //deploying power to expression
                  var expression = Math.pow(formula, power);
                  expression = sliderValue * expression;
                  expression = Math.round(expression);
                  // console.log("expression:",expression);
                  $scope.compoundInterest.push(expression);
                  // console.log("final:",$scope.compoundInterest);
               }

               // var si = (yearVal * $scope.rate * $scope.sliderValue)/100;
               // si =  Math.round(si);
               // $scope.simpleInterest.push(si);

               // //logic for compound interest..
               // var power = $scope.interestCompounded * yearVal;
               // var rate = $scope.rate/100;
               // var division = 1 + (rate/$scope.interestCompounded);
               // var ci = $scope.sliderValue * Math.pow(division, power);
               // ci = Math.round(ci);
               // $scope.compoundInterest.push(ci);
            })

            $('.simple').highcharts({
                chart: {
                    type: 'area'
                },
                title: {
                    text: $scope.chart_content.CONTENT.GRAPH1_LABEL
                },
                subtitle: {
                    text: 'For '+lastYear+' Years'
                },
                xAxis: {
                    categories: $scope.years,
                    tickmarkPlacement: 'on',
                    title: {
                        enabled: false
                    }
                },
                yAxis: {
                    title: {
                        text: 'Dollars'
                    },
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    valuePrefix: '$'
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#666666'
                        }
                    }
                },
                series: [{
                    name: 'Dollars',
                    // data: [100, Value+222, 809, 900, 950, 1050, 1200]
                    data: $scope.simpleInterest
                } ]
            });
            
            $('.compound').highcharts({
                chart: {
                    type: 'area'
                },
                title: {
                    text: $scope.chart_content.CONTENT.GRAPH2_LABEL
                },
                subtitle: {
                    text: 'For '+lastYear+' Years'
                },
                xAxis: {
                    categories: $scope.years,
                    tickmarkPlacement: 'on',
                    title: {
                        enabled: false
                    }
                },
                yAxis: {
                    title: {
                        text: 'Dollars'
                    },
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    valuePrefix: '$'
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineColor: '#666666',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#666666'
                        }
                    }
                },
                series: [{
                    name: 'Dollars',
                    data: $scope.compoundInterest
                }]
            });  
                             

            // Load the fonts
            Highcharts.createElement('link', {
               href: '//fonts.googleapis.com/css?family=Unica+One',
               rel: 'stylesheet',
               type: 'text/css'
            }, null, document.getElementsByTagName('head')[0]);

            Highcharts.theme = {
               colors: ["#ffc61a", "#db4453", "#8cc051", "#36bc9b", "#3baeda", "#3baeda",
                  "#55BF3B", "#DF5353", "#7798BF", "#aaeeee", "#ffc61a"],
               chart: {
                  backgroundColor: {
                     linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                     stops: [
                        [0, '#2f3543'],
                        [1, '#2f3543']
                     ]
                  },
                  style: {
                     fontFamily: "'Unica One', sans-serif"
                  },
                  plotBorderColor: '#606063'
               },
               title: {
                  style: {
                     color: '#E0E0E3',
                     textTransform: 'uppercase',
                     fontSize: '20px'
                  }
               },
               subtitle: {
                  style: {
                     color: '#E0E0E3',
                     textTransform: 'uppercase'
                  }
               },
               xAxis: {
                  gridLineColor: '#3e4658',
                  labels: {
                     style: {
                        color: '#E0E0E3'
                     }
                  },
                  lineColor: '#3e4658',
                  minorGridLineColor: '#505053',
                  tickColor: '#3e4658',
                  title: {
                     style: {
                        color: '#A0A0A3'

                     }
                  }
               },
               yAxis: {
                  gridLineColor: '#3e4658',
                  labels: {
                     style: {
                        color: '#E0E0E3'
                     }
                  },
                  lineColor: '#3e4658',
                  minorGridLineColor: '#505053',
                  tickColor: '#3e4658',
                  tickWidth: 1,
                  title: {
                     style: {
                        color: '#A0A0A3'
                     }
                  }
               },
               tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  style: {
                     color: '#F0F0F0'
                  }
               },
               plotOptions: {
                  series: {
                     dataLabels: {
                        color: '#B0B0B3'
                     },
                     marker: {
                        lineColor: '#333'
                     }
                  },
                  boxplot: {
                     fillColor: '#505053'
                  },
                  candlestick: {
                     lineColor: 'white'
                  },
                  errorbar: {
                     color: 'white'
                  }
               },
               legend: {
                  itemStyle: {
                     color: '#E0E0E3'
                  },
                  itemHoverStyle: {
                     color: '#FFF'
                  },
                  itemHiddenStyle: {
                     color: '#606063'
                  }
               },
               credits: {
                  style: {
                     color: '#666'
                  }
               },
               labels: {
                  style: {
                     color: '#3e4658'
                  }
               },

               drilldown: {
                  activeAxisLabelStyle: {
                     color: '#F0F0F3'
                  },
                  activeDataLabelStyle: {
                     color: '#F0F0F3'
                  }
               },

               navigation: {
                  buttonOptions: {
                     symbolStroke: '#DDDDDD',
                     theme: {
                        fill: '#505053'
                     }
                  }
               },

               // scroll charts
               rangeSelector: {
                  buttonTheme: {
                     fill: '#505053',
                     stroke: '#000000',
                     style: {
                        color: '#CCC'
                     },
                     states: {
                        hover: {
                           fill: '#3e4658',
                           stroke: '#000000',
                           style: {
                              color: 'white'
                           }
                        },
                        select: {
                           fill: '#000003',
                           stroke: '#000000',
                           style: {
                              color: 'white'
                           }
                        }
                     }
                  },
                  inputBoxBorderColor: '#505053',
                  inputStyle: {
                     backgroundColor: '#333',
                     color: 'silver'
                  },
                  labelStyle: {
                     color: 'silver'
                  }
               },

               navigator: {
                  handles: {
                     backgroundColor: '#666',
                     borderColor: '#AAA'
                  },
                  outlineColor: '#CCC',
                  maskFill: 'rgba(255,255,255,0.1)',
                  series: {
                     color: '#7798BF',
                     lineColor: '#A6C7ED'
                  },
                  xAxis: {
                     gridLineColor: '#3e4658'
                  }
               },

               scrollbar: {
                  barBackgroundColor: '#808083',
                  barBorderColor: '#808083',
                  buttonArrowColor: '#CCC',
                  buttonBackgroundColor: '#606063',

                  buttonBorderColor: '#606063',
                  rifleColor: '#FFF',
                  trackBackgroundColor: '#404043',
                  trackBorderColor: '#404043'
               },

               // special colors for some of the
               legendBackgroundColor: 'rgba(47, 53, 63, 0.5)',
               background2: '#505053',
               dataLabelsColor: '#B0B0B3',
               textColor: '#C0C0C0',
               contrastTextColor: '#F0F0F3',
               maskColor: 'rgba(255,255,255,0.3)'
            };

            // Apply the theme
            Highcharts.setOptions(Highcharts.theme);
        }
    }])
