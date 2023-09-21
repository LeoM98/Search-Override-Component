/************************************************************************************************************
* @author Globant - Leonardo Monsalvo
* @description class for test the controller CreateAndEditFundsOverrideCtr 
* @date 18-09-2023
* @group Salesforce Factory
* Versions
* -----------------------------------------------------------------------------------------------------------
* No.   Date            Author                  	Description
* ---   ----------      ---------------            	----------------------------------------------------------
* 1.0   18-09-2023		Leonardo Monsalvo			Creation Class
**************************************************************************************************************/
@isTest
public with sharing class CreateAndEditFundsOverrideCtr_Test {
    
    @TestSetup
    static void makeData(){

        Id pricebookId = Test.getStandardPricebookId();

        Opportunity opp = (Opportunity)TestDataFactory.createSObject('Opportunity', new Map<String,Object> {
            'Name'        => 'Test X',
            'StageName'   => 'Prospecting',
            'CloseDate'   => Date.today()
        }, true);

        //Create your product
        Product2 prod = (Product2)TestDataFactory.createSObject('Product2', new Map<String,Object> {
            'Name'        => 'Product X',
            'isActive'    => true,
            'ProductCode' => '1345'
        }, true);

        //Create your pricebook entry
        PricebookEntry pbEntry = (PricebookEntry)TestDataFactory.createSObject('PricebookEntry', new Map<String,Object> {
            'Pricebook2Id' => pricebookId,
            'Product2Id'   => prod.Id,
            'UnitPrice'    => 100.00,
            'IsActive'     => true
        }, true);

        OpportunityLineItem oli = (OpportunityLineItem)TestDataFactory.createSObject('OpportunityLineItem', new Map<String,Object> {
            'OpportunityId' => opp.Id,
            'Quantity' => 5,
            'PSR_IDBLabCore__c' => 1200,
            'PricebookEntryId' => pbEntry.Id,
            'UnitPrice' => pbEntry.UnitPrice * 5
        }, true);
        
        TestDataFactory.createSObject('Trust_Fund__c', new Map<String,Object> {
            'Amount__c' => 100,
            'Type_of_Fund__c' => 'Adaptation Fund',
            'Opportunity_Product__c' => oli.Id
        }, true);
        
    }

    @isTest
    public static void fetchFundTypeTest(){

        Test.startTest();
        String searchKey = 'Col';
        List<PicklistValueInfo> response = CreateAndEditFundsOverrideCtr.fetchFundType(searchKey);
        Assert.isTrue(!response.isEmpty(), 'The response returned contains values');
        Assert.isNotNull(response, 'The response is not null');
        Test.stopTest();
    }

    @isTest
    public static void getFundsTest(){

        OpportunityLineItem oli = [SELECT Id FROM OpportunityLineItem LIMIT 1];
        Test.startTest();
        List<Trust_Fund__c> response = CreateAndEditFundsOverrideCtr.getFunds(oli.Id);
        Assert.isTrue(!response.isEmpty(), 'The response returned contains values');
        Assert.isNotNull(response, 'The response is not null');
        Test.stopTest();
    }

}