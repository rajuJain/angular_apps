'use strict';

/**
 *
 * @ngdoc service
 * @name sdi.service:serviceExamCode
 * @description Service to provide exam code based on exam type selected and question answered, from user before an appointment must be added.
 * All questions are generated on basis of exam/test type selected.
 */

angular.module('sdi')
.provider('serviceExamCode', function () {
  
  var allTypes = ['Mammogram Screening', 'Mammogram Diagnostic', 'DEXA', 'Breast', 'Pelvic', 'Abdomen', 'Carotid', 'Thyriod'];
  
  
  var examCodes = {
		    'DEXA' : {
				'ARHD'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'ARHDDEXA1'},
				'BEMO'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'BEMODEXA1'},
				'CDS'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'CDSDEXA1'},
				'PALM'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'PALMDEXA'},
				'PDVO'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'PDVODEXA1'},
				'SUNWEST': {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'SWODEXA1'},
				'SWBC'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'SWODEXA1'},
				'UNHO'	: {examCode : 'DEXAHIPSPN', patientType : 'O', resourceCode : 'UNHODEXA1'},
				'MTV'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'},
				'FH'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'},
				'TC'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'},
				'TAS'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'},
				'TPK'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'},
				'GMC'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'},
				'HIL'	: {examCode : 'DEXABOD*', patientType : 'O', resourceCode : 'DEXA1'}
				
		    },
		    
		    'Mammogram Screening'  : {
		      
				'ARHD' :[
					  {examCode : 'MAMSCRNBIL', patientType : 'VSCRN', resourceCode : 'ARHDMAM1'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'ARHDMAM1'}
					],
				
				'BEMO' :[
					  {examCode : 'MAMDIGSCRN', patientType : 'VSCRN', resourceCode : 'BEMOMAM1, BEMOMAM2'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'BEMOMAM1, BEMOMAM2'}
					],
				'CDS' : [
					  {examCode : 'MAMSCRNBIL', patientType : 'VSCRN', resourceCode : 'CDSMAM1'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'CDSMAM1'}
					],
				'DSR' : {examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM1'},
				'PDVO': [
					  {examCode : 'MAMDIGSCRN', patientType : 'VSCRN', resourceCode : 'PDVOMG2'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'PDVOMG1'}
					],
				/*'PAS2': [
					  {examCode : 'MAMDIGSCRN', patientType : 'VSCRN', resourceCode : 'P2MAM1'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'P2MAM1'}
					],
				*/
				'PALM': [
					  {examCode : 'MAMDIGSCRN', patientType : 'VSCRN', resourceCode : 'PALMMAM1'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'PALMMAM1'}
					],
				'SWBC': [
					  {examCode : 'MAMSCRNBIL', patientType : 'O', resourceCode : 'SWBCMAM1, SWBCMAM2'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'SWBCMAM1, SWBCMAM2'},
					  {question : [14], condition : 'Yes', examCode : 'MAMCOMBBIL', patientType : 'V3DSCRN', resourceCode : 'SWBCMAM1'},
					  {question : [12,13,14], condition : 'Yes', examCode : 'MAMCOMIMPB', patientType : 'V3DSCRN', resourceCode : 'SWBCMAM1'}
					],
					
				'FH'  : {examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM1'},
				'GMC' : {examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM1'},
				'HIL' : {examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM1'},
				
				'MTV' : [
					{examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM2'},
					{question : [14], condition : 'Yes', examCode : 'MAMCOMBBIL', patientType : '3DSCRN', resourceCode : 'MM1'}
				       ],
				
				'TAS' : {examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM1'},
				'TC' : [
					{examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM2'},
					{question : [14], condition : 'Yes', examCode : 'MAMCOMBBIL', patientType : '3DSCRN', resourceCode : 'MM1'},
					{question : [12,13,14], condition : 'Yes', examCode : 'MAMCOMIMPB', patientType : '3DSCRN', resourceCode : 'MM1'},
					
					
				       ],
				'TPK' :{examCode : 'MAMSCRNDIG', patientType : 'SCRN', resourceCode : 'MM1'},
				'UNHO' :[
					  {examCode : 'MAMSCRNBIL', patientType : 'VSCRN', resourceCode : 'UNHOMM1'},
					  {question : [12,13], condition : 'Yes', examCode : 'MAMIMPSCBI', patientType : 'VSCRN', resourceCode : 'UNHOMM1'}
					],
		    },
		    
		    'Mammogram Diagnostic' : {
		      
				'BEMO'	: [
					    {examCode : 'MAMDIAGBI*', patientType : 'VRE', resourceCode : 'BEMOMAM2'},
					    {question : [10], condition : 'Yes',examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'BEMOMAM2'},
					    {question : [11], condition : 'Yes',examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'BEMOMAM2'}
					    //{question : [28], condition : 'Yes', examCode : 'MAMDIAGB**', patientType : 'VRE', resourceCode : 'BEMOMAM2'}
					  ],	
				
				'CDS' 	: {examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'CDSMAM1'},
				
				'PDVO'	: [
					    {examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'PDVOMG1'},
					    {question : [10], condition : 'Yes', examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'PDVOMG1'},
					    {question : [11], condition : 'Yes', examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'PDVOMG1'}
					    //{question : [28], condition : 'Yes', examCode : 'MAMDIAG*', patientType : 'VRE', resourceCode : 'PDVOMG1'}
					  ],
				'SWBC'	: [
					    {examCode : 'MAMDIAGBI*', patientType : 'VDX', resourceCode : 'SWBCMAM2'},
					    {question : [10,12,13], condition : 'Yes', examCode : 'MAMIMPDXBI', patientType : 'VDX', resourceCode : 'SWBCMAM2'},
					    {question : [11,12,13], condition : 'Yes', examCode : 'MAMIMPDXBI', patientType : 'VDX', resourceCode : 'SWBCMAM2'},
					    //{question : [28], condition : 'Yes', examCode : 'MAMDIAGBI**', patientType : 'VDX', resourceCode : 'SWBCMAM2'},	
					   
					    {question : [10,14], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : 'V3DDX', resourceCode : 'SWBCMAM1'},
					    {question : [11,14], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : 'V3DDX', resourceCode : 'SWBCMAM1'},
					    
					    //{question : [14,28], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : 'V3DDX', resourceCode : 'SWBCMAM1'},
					    {question : [10,12,13,14], condition : 'Yes', examCode : 'MAMCOMIMPB', patientType : 'V3DDX', resourceCode : 'SWBCMAM1'},
					    {question : [11,12,13,14], condition : 'Yes', examCode : 'MAMCOMIMPB', patientType : 'V3DDX', resourceCode : 'SWBCMAM1'},
					    //{question : [12,13,14,28], condition : 'Yes', examCode : 'MAMCOMIMPB', patientType : 'V3DDX', resourceCode : 'SWBCMAM1'}
					    
					  ],
				'MTV'	: [
					    {examCode : 'MAMDIAGDIG', patientType : 'DX', resourceCode : 'MM2'},
					    //{question : [10,11,14,28], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : 'DIAGMAMM', resourceCode : 'MM2'}
						{question : [10,11,14], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : '3DDX', resourceCode : 'MM1'}
					  ],
				
				'GMC'	: {examCode : 'MAMDIAGDIG', patientType : 'DX', resourceCode : 'MM2'},
				
				'TC'	: [
					    {examCode : 'MAMDIAGDIG', patientType : 'DX', resourceCode : 'MM2'},
					    {question : [10,14], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : '3DDX', resourceCode : 'MM1'},
					    {question : [11,14], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : '3DDX', resourceCode : 'MM1'},
					    //{question : [14,28], condition : 'Yes', examCode : 'MAMCOMBBDX', patientType : 'DIAGMAMM', resourceCode : 'MM1'},
					    {question : [10,12,13,14], condition : 'Yes', examCode : 'MAMCOMIMBD', patientType : '3DDX', resourceCode : 'MM1'},
					    {question : [11,12,13,14], condition : 'Yes', examCode : 'MAMCOMIMBD', patientType : '3DDX', resourceCode : 'MM1'},
					    //{question : [12,13,14,28], condition : 'Yes', examCode : 'MAMCOMIMBD', patientType : 'DIAGMAMM', resourceCode : 'MM1'}
					  ]
		    },
		    
		    'Breast' :  {
		      
				'BEMO' 	: [
				  //VRE change to VDX for default
					    {examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'BEMOUS2,BEMOUS3'},
					    {question : [10], condition : 'Yes', examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'BEMOUS2,BEMOUS3'},
					    {question : [11], condition : 'Yes', examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'BEMOUS2,BEMOUS3'}
					    //{question : [28], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VRE', resourceCode : 'BEMOUS2,BEMOUS3'}
					  ],
					
				'CDS'  	: {examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'CDSUS2'},
				
				'PDVO' 	: [
					    {examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'PDVOUS2'},
					    {question : [10], condition : 'Yes',examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'PDVOUS2'},
					    {question : [11], condition : 'Yes',examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'PDVOUS2'},
					    //{question : [28], condition : 'Yes', examCode : 'USBREAST*', patientType : 'VRE', resourceCode : 'PDVOUS2'}
					  ],
				
				'SWBC' 	: [
					    {examCode : 'USBREAST*', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    {question : [10], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    {question : [11], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    //{question : [28], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    {question : [10,14], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    {question : [11,14], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    //{question : [14,28], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCUS3'},
					    {question : [10,12,13,14], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCMAM!'},
					    {question : [11,12,13,14], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCMAM!'},
					    //{question : [12,13,14,28], condition : 'Yes', examCode : 'USBREAST**', patientType : 'VDX', resourceCode : 'SWBCMAM!'},
					  ],
				//MTV,GMC,TC - USBREAST will replaced with VDX for now. AS Error code 251 occurred: PatientTypeCode not found: USBREAST
				'MTV' : [
					  {examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US4'},
					  {question : [10], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US4'},
					  {question : [11], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US4'},
					  //{question : [28], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'VDX', resourceCode : 'US4'}
					],
				
				'GMC' : {examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US1,US2'},
				
				'TC'  : [
					  {examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US2'},
					  {question : [10,14], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US2'},
					  {question : [11,14], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US2'},
					  //{question : [14,28], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'VDX', resourceCode : 'US2'},
					  {question : [10,12,13,14], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US2'},
					  {question : [11,12,13,14], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'DX', resourceCode : 'US2'},
					  //{question : [12,13,14,28], condition : 'Yes', examCode : 'USBREASTBI', patientType : 'VDX', resourceCode : 'US2'},
					]
		    },
		    
		    
		    'Pelvic' :  {
				  'ARHD'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'ARHDUS1,ARHDUS2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'ARHDUS1,ARHDUS2'}
					    ],
				  'BEMO'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'BEMOUS1,BEMOUS4,BEMOUS5'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'BEMOUS1,BEMOUS4,BEMOUS5'}
					    ],
				  
				  'CDS'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'CDSUS1, CDSUS2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'CDSUS1, CDSUS2'}
					    ],
				  
				  'PALM'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'PALMUS1,PALMUS2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'PALMUS1,PALMUS2, PALMUS3'}
					    ],
				  
				  'PAS1'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'P1US1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'P1US1'}
					    ],
				  
				  'PAS2'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'PSUS1,P2US2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'PSUS1,P2US2'}
					    ],
				  
				  'PDVO'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'PDVOUS1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'PDVOUS1'}
					    ],
				  'UNHO'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'UNHOUS1,UNHOUS2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'UNHOUS1,UNHOUS2'}
					    ],
				  'DSR'  : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1'}
					    ],
				  
				  'FH'    : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1'}
					    ],
				  
				  'GMC'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1, US2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1, US2'}
					    ],
				  
				  'HIL'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1'}
					    ],
				  
				  'MTV'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1, US2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1'}
					    ],
				  
				  'SIC'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1, US2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1, US2'}
					    ],
				  
				  'TAS'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1'}
					    ],
				  
				  'TC'    : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1, US2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US2, US3'}
					    ],
				  
				  'TPK'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US1, US2'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US1, US2'}
					    ],
				  'TBO'   : [
					      {gender : 'F', examCode : 'USPELTRAN', patientType : 'O', resourceCode : 'US-OB1, US1'},
					      {gender : 'M', examCode : 'USPELVLTD', patientType : 'O', resourceCode : 'US-OB1, US1'}
					    ]
				  
 				},
				
		    'Abdomen':  {
				    'ARHD'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'ARHDUS1,ARHDUS2'},
				    'BEMO'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'BEMOUS1,BEMOUS4,BEMOUS5'},
				    'CDS'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'CDSUS1, CDSUS2'},
				    'PALM'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'PALMUS1,PALMUS2,PALMUS3'},
				    'PAS1'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'P1US1'},
				    'PAS2'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'P2US1,P2US2'},
				    'UNHO'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'UNHOUS1,UNHOUS2'},
				    'DSR'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1'},
				    'FH'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1'},
				    'GMC'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1,US2'},
				    'HIL'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1'},
				    'MTV'	: [
						    {gender : 'F',examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US3'},
						    {gender : 'M',examCode : 'USABDCOMM', patientType : 'O', resourceCode : 'US1'}
						  ],
				    'SIC'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1,US2'},
				    'TAS'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1'},
				    'TC'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US2, US3'},
				    'TPK'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US1, US2'},
				    'TBO'	: {examCode : 'USABDCOMP', patientType : 'O', resourceCode : 'US-OB1, US1'}
				},
				
		    'Carotid':  {
				    'ARHD'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'ARHDUS1, ARHDUS2'},
				    'BEMO'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'BEMOUS1'},
				    'CDS'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'CDSUS1,CDSUS2'},
				    'DSR'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US1'},
				    'PALM'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'PALMUS1,PALMUS2,PALMUS3'},
				    'PAS1'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'P1US1'},
				    'PAS2'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'PSUS1,PSUS2'},
				    'PDVO'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'PDVOUS1'},
				    'UNHO'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'UNHOUS1,UNHOUS2'},
				    'FH'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US1'},
				    'GMC'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US1,US2'},
				    'MTV'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US5'},
				    'SIC'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US1,US2'},
				    'TAS'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US1'},
				    'TC'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US2,US3'},
				    'TPK'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US1,US2'},
				    'TBO'	: {examCode : 'USCAROTID', patientType : 'O', resourceCode : 'US-OB1, US1'}  
				},
		    
		    'Thyriod':  {
				  'ARHD'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'ARHDUS1, ARHDUS2'},
				  'BEMO'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'BEMOUS1,BEMOUS4,BEMOUS5'},
				  'CDS'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'CDSUS1'},
				  'PALM'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'PALMUS1,PALMUS2,PALMUS3'},
				  'PAS1'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'P1US1'},
				  'PAS2'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'PSUS1,PSUS2'},
				  'PDVO'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'PDVOUS1,PDVOUS3'},
				  'SWBC'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'SWBCUS3'},
				  'UNHO'	: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'UNHOUS1,UNHOUS2'},
				  'DSR'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1'},
				  'FH'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1'},
				  'GMC'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1,US2'},
				  'HIL'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1'},
				  'MTV'		: [
						   {gender : 'F', examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US3'},
						   {gender : 'M',examCode : 'USSOFTISSM', patientType : 'O', resourceCode : 'US1'}
						  ],
				  
				  'SIC'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1,US2'},
				  'TAS'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1'},
				  'TC'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US2,US3'},
				  'TPK'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US1,US2'},
				  'TBO'		: {examCode : 'USSOFTISSU', patientType : 'O', resourceCode : 'US-OB1, US1'}
				}
		};		  
			  
  this.$get = ['serviceGlobal', 'serviceData', function (serviceGlobal, serviceData) {
    
    //Set exam priority here. For now Pelvic have highest search priority
    var examPriority = ['Pelvic', 'Mammogram Screening', 'DEXA', 'Mammogram Diagnostic', 'Breast', 'Abdomen', 'Carotid', 'Thyriod'];
    
    //Add location which need to reject for particular exam or combo
    var rejectedLocationsCode = {
			      'Pelvic' : [],
			      'Mammogram Screening' : ['PAS2'],
			      'DEXA' : [],
			      'Mammogram Diagnostic' : [],
			      'Breast' : [],
			      'Abdomen' : [],
			      'Carotid' : [],
			      'Thyriod' : [],
			      
			      'DEXA,Mammogram Diagnostic,Breast' : [],
			      'Mammogram Diagnostic,Breast':[],
			      'Mammogram Screening,DEXA': [],
			      'Pelvic,Mammogram Diagnostic,Breast' : [],
			      'Pelvic,Abdomen' : [],
			      'Pelvic,Mammogram Screening' : ['PAS2']
			    };
    var getExamCode = function(){
      //Exam code generation
      // examData exams selected at home
      // orgCode particular location selected for exams
      // examCodes all org wise codes
      
      var examData = serviceGlobal.home.examData;
      var orgCode = serviceGlobal.findLocation.location.Code;
      
      var answerData = serviceGlobal.exam.examAnswers;
      var commaSeperatedCode = '';
      var examCodeArray = {};
      
      for(var ai=0; ai<examData.length;ai++){
	  
	  var currentIndexObj = {};
	  
	  if( examCodes[examData[ai]] && examCodes[examData[ai]][orgCode] && angular.isArray(examCodes[examData[ai]][orgCode]))
	  {
	    for(var oi = ( examCodes[examData[ai]][orgCode].length-1 ); oi >= 0; oi--)
	    {
		if (examCodes[examData[ai]][orgCode][oi].question && angular.isArray(examCodes[examData[ai]][orgCode][oi].question)) {
		  var questions = examCodes[examData[ai]][orgCode][oi].question;
		  var conditions = examCodes[examData[ai]][orgCode][oi].condition;
		  
		    if (questions.length === 1) {
		      if (answerData[questions[0]] == conditions) {
			  currentIndexObj = examCodes[examData[ai]][orgCode][oi];
			  break;
		      }
		    }else if (!angular.isArray(conditions)) {
		      var conditionStatusFlag = 1;
		      
		      for(var qi = 0; qi < questions.length; qi++){
			if (answerData[questions[qi]] && answerData[questions[qi]] != conditions) {
			  conditionStatusFlag = 0;
			}
		      }
		      if (conditionStatusFlag === 1) {
			currentIndexObj = examCodes[examData[ai]][orgCode][oi];
			break;
		      }
		    }else if (angular.isArray(conditions) && conditions.length == questions.length) {
		      var conditionStatusFlag = 1;
		      for(var qi = 0; qi < questions.length; qi++){
			if (answerData[questions[qi]] && answerData[questions[qi]] != conditions[qi]) {
			  conditionStatusFlag = 0;
			}
		      }
		      if (conditionStatusFlag === 1) {
			currentIndexObj = examCodes[examData[ai]][orgCode][oi];
			break;
		      }
		    }
		}else if (examCodes[examData[ai]][orgCode][oi].gender) {
		  if(examCodes[examData[ai]][orgCode][oi].gender == serviceGlobal.userSession.gender){
		    currentIndexObj = examCodes[examData[ai]][orgCode][oi];
		  }
		}else if(examCodes[examData[ai]][orgCode][oi] != ''){
		  currentIndexObj = examCodes[examData[ai]][orgCode][oi];
		  break;
		}
	    }
	    if(!currentIndexObj && examCodes[examData[ai]][orgCode] && examCodes[examData[ai]][orgCode].length == 1){
		currentIndexObj = examCodes[examData[ai]][orgCode][0];		  
	    }
	  }else if(examCodes[examData[ai]][orgCode] && examCodes[examData[ai]][orgCode].examCode){
	    currentIndexObj = examCodes[examData[ai]][orgCode];
	  }
	  
	  if(currentIndexObj){
	      commaSeperatedCode += currentIndexObj.examCode + ",";
	      examCodeArray[examData[ai]] = currentIndexObj;	
	  }
	  
      }
      
      return {commaSeperatedCode : commaSeperatedCode, examCodeArray : examCodeArray};
    };

    var getCommonVal = function(a, b){
      
      serviceData.logData(a);
      serviceData.logData(b);
      var result = [];
      if( a.length > 0 && b.length > 0 )
      {  
	for(var ai = 0; ai < a.length; ai++){
	  if(b.indexOf(a[ai]) != -1){
		  result.push(a[ai]);
	  }	
	}
      }

      return result;
    };


    var getExamLocationCode = function(){
	var examCodes = [];
	var examCodeString = '';
	var exams = serviceGlobal.home.examData;
	if (exams.length == 1) {
	  examCodes = exams;
	  examCodeString = examCodes;
	}else{
	  var priorityWiseExams = [];
	  angular.forEach(exams, function(examValue,key){
	      priorityWiseExams[examPriority.indexOf(examValue)] = examValue;
	  });
	  angular.forEach(priorityWiseExams, function(examObj,priorityIndex){
	      examCodes.push(examObj);
	  });
	  examCodeString = examCodes.join();
	}
	
	var questions = serviceGlobal.exam;
    	var codes = [];
	var rejectedLocations = rejectedLocationsCode[examCodeString];
	
    	if(examCodes.length > 0){
    	    var validExamLocations = {
		  'DEXA' : ['ARHD','BEMO','CDS','PALM','PDVO','SUNWEST','SWBC','UNHO','MTV','FH','TC','TAS','TPK','GMC','HIL'],
		  'Mammogram Screening'  : ['ARHD','BEMO','CDS','DSR','PDVO','PAS2','PALM','SWBC','FH','GMC','HIL','MTV','TAS','TC','TPK','UNHO'],
		  'Mammogram Diagnostic' : ['BEMO','CDS','PDVO','SWBC','MTV','GMC','TC'],
		  'Breast' :  ['BEMO','CDS','PDVO','SWBC','MTV','GMC','TC'],
		  'Pelvic' :  ['ARHD','BEMO','CDS','PALM','PAS1','PAS2','PDVO','UNHO','DSR','FH','GMC','HIL','MTV','SIC','TAS','TC','TPK','TBO'],
		  'Abdomen':  ['ARHD','BEMO','CDS','PALM','PAS1','PAS2','UNHO','DSR','FH','GMC','HIL','MTV','SIC','TAS','TC','TPK','TBO'],
		  'Carotid':  ['ARHD','BEMO','CDS','DSR','PALM','PAS1','PAS2','PDVO','UNHO','FH','GMC','MTV','SIC','TAS','TC','TPK','TBO'],
		  'Thyriod':  ['ARHD','BEMO','CDS','PALM','PAS1','PAS2','PDVO','SWBC','UNHO','DSR','FH','GMC','HIL','MTV','SIC','TAS','TC','TPK','TBO']
	       };

		if (examCodes.indexOf('Thyriod') != -1 && serviceGlobal.userSession.gender == 'M') {
		  validExamLocations['Thyriod'].splice(validExamLocations['Thyriod'].indexOf('MTV'), 1);
		}

	    if(examCodes.length === 1){
		 if (examCodes[0] === 'DEXA') {
		   validExamLocations[examCodes[0]].splice(validExamLocations[examCodes[0]].indexOf('SWBC'), 1);
		 }
		 codes = validExamLocations[examCodes[0]];  
		}else{
		 for(var i =0; i < examCodes.length; i++){
		   if(codes.length  === 0 && validExamLocations[examCodes[i+1]]){
			   codes = getCommonVal(validExamLocations[examCodes[i]], validExamLocations[examCodes[i+1]]);
		   }else if(validExamLocations[examCodes[i+1]]){
			   codes = getCommonVal(codes,validExamLocations[examCodes[i+1]]);
		   }					
		 }	
	       }
		   
		   
	       
	       if(questions.examAnswers['14'] && questions.examAnswers['14'] == 'Yes'){
		   if (examCodes.indexOf('Pelvic') != -1) {
		     codes = ['MTV','TC'];
		   }else{
		    console.log(questions.examAnswers['10'],questions.examAnswers['11'],exams.indexOf('Mammogram Diagnostic'));
		    if ( ((!questions.examAnswers['10'] && questions.examAnswers['10'] == 'Yes' ) || (!questions.examAnswers['10'] && !questions.examAnswers['11']) || (questions.examAnswers['11'] && questions.examAnswers['11'] == 'Yes' )) && exams.indexOf('Mammogram Diagnostic') != -1) {
		      codes = ['MTV','TC']; 
		    }else{
		      codes = ['MTV','SWBC','TC']; 
		     
		    }
		   }
		 
	       }else if ( ((questions.examAnswers['12'] && questions.examAnswers['12'] == 'Yes') || (questions.examAnswers['13'] && questions.examAnswers['13'] == 'Yes')) && exams.indexOf('Mammogram Screening') != -1 ) {
		  var swbcIndex = codes.indexOf('SWBC');
		  if (swbcIndex != -1) {
		    codes.splice(swbcIndex, 1);  
		  }
		
	       }
		
	      var finalLocationCodes = [];
	      
	      if(rejectedLocations && rejectedLocations.length > 0) {
			finalLocationCodes = codes.filter(function(item, i) {
				  return rejectedLocations.indexOf(item) === -1;
			});
	      }else{
			finalLocationCodes = codes;
	      }
	      serviceData.logData(finalLocationCodes);
	      return finalLocationCodes;
	}else{
	       return false;
	}
    };


    var examInstructions = function(){
        return  {
              /*'DEXA'                        : 'DEXAInstruction',
              'DEXA,Mammogram Diagnostic,Breast'   : 'DEXAMammogramDiagnosticInstruction',
              'Mammogram Screening'         : 'MammogramScreeningInstruction',
              'DEXA,Mammogram Screening'    : 'DEXAMammogramScreeningInstruction',
              'Abdomen'                     : 'AbdomenInstruction',
              'Carotid'                     : 'CarotidInstruction',
              'Pelvic'                      : 'PelvicInstruction',
              'Thyriod'                     : 'ThyriodInstruction',
              'Pelvic,Mammogram Diagnostic,Breast' : 'PelvicMammogramDiagnosticInstruction',
              'Pelvic,Abdomen'              : 'PelvicAbdomenInstruction',
              'Pelvic,Mammogram Screening'  : 'PelvicMammogramScreeningInstruction'*/
	      
	      'DEXA'	: 'DEXAInstruction',
              'Abdomen'	: 'AbdomenInstruction',
              'Carotid'	: 'DEXAInstruction',
              'Pelvic'	: 'PelvicInstruction',
              'Thyriod'	: 'DEXAInstruction',
              'Breast'	: 'MammogramDiagnosticInstruction',
              'Mammogram Diagnostic'	: 'MammogramDiagnosticInstruction',
              'Mammogram Screening'	: 'MammogramDiagnosticInstruction'
          }
    };

    return {
      getExamCode : getExamCode,
      examInstructions : examInstructions,
      getExamLocationCode : getExamLocationCode,
      examPriority : examPriority
    };
    
  }];
});