import { LightningElement, api, track, wire } from 'lwc';
import fetchFundType from '@salesforce/apex/CreateAndEditFundsOverrideCtr.fetchFundType';
import getFunds from '@salesforce/apex/CreateAndEditFundsOverrideCtr.getFunds';
import uId from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'Edit', name: 'Edit', iconName: 'utility:edit_gpt' },
    { label: 'Delete', name: 'Delete', iconName: 'utility:delete' },
    { label: 'View', name: 'View', iconName: 'utility:preview' },
];
const COLUMNS = [
    { label: 'Type of Fund', fieldName: 'Type_of_Fund__c' },
    { label: 'Amount($)', fieldName: 'Amount__c', type: 'currency' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions, menuAlignment: 'right' }
    }
];

export default class CreateAndEditFundsOverride extends LightningElement {

    //Creation and Edit funds variables
    @api recordId; //Opportunity Product Id
    @api target = '_blank';
    @track editRecordId; //TrustFundId
    @track funds; //List of matched funds types field.
    @track error;
    @track tableFunds; //Funds Displayed in Table
    @track wiredFunds; //RefreshApex
    @track searchKey; //Search Variable.
    @track selectedFunds;
    @track userId = uId;
    @track isLoading = false; //Spinner variable
    @track creationForm = true;
    @track recordEditForm = false;
    @track label = 'Distribution of Core Mobilization';
    @track tableLabelCount;
    columns = COLUMNS; //Columns for the table

    //Modal Variables 
    @track isModalOpen = false; //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded
    @track modalLabel;

    /* Pagination Variables */
    page = 1; //initialize 1st page
    items = []; //contains all the records.
    startingRecord = 1; //start record position per page
    endingRecord = 0; //end record position per page
    pageSize = 5; //default value we are assigning
    totalRecountCount = 0; //total record count received from all retrieved records
    totalPage = 0; //total number of page is needed to display all records

    //Get table values
    @wire(getFunds, { trustId: '$recordId' })
    wiredFundsMethod(result) {
        this.wiredFunds = result;
        if (result.data) {
            this.items = result.data;
            this.totalRecountCount = result.data.length;
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
            this.tableLabelCount = this.label+ ' ('+this.totalRecountCount+')';
            //here we slice the data according page size
            this.tableFunds = this.items.slice(0, this.pageSize);
            this.endingRecord = this.pageSize;
            this.error = undefined;
        } else if (result.error) {
            this.accounts = undefined;
            this.error = result.error;
        }
    }

    //Call the modal to create new funds
    newTrustFundModal() {
        // to open modal set isModalOpen tarck value as true
        this.modalLabel = 'Create ' + this.label;
        this.isModalOpen = true;
    }

    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    //press on previous button this method will be called
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }

    //press on next button this method will be called
    nextHandler() {
        if ((this.page < this.totalPage) && this.page !== this.totalPage) {
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);
        }
    }

    //this method displays records page by page
    displayRecordPerPage(page) {

        this.startingRecord = ((page - 1) * this.pageSize);
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount)
            ? this.totalRecountCount : this.endingRecord;

        this.tableFunds = this.items.slice(this.startingRecord, this.endingRecord);

        //increment by 1 to display the startingRecord count, 
        //so for 2nd page, it will show "Displaying 6 to 10 of 23 records. Page 2 of 5"
        this.startingRecord = this.startingRecord + 1;
    }

    handleChange(event) {

        this.searchKey = event.detail.value;
        console.log('searchKey is', this.searchKey);

        if (this.searchKey) {

            fetchFundType({ searchKey: this.searchKey })
                .then(result => {

                    console.log('result is', JSON.stringify(result));
                    let tempfunds = [];
                    result.forEach((record) => {

                        let tempRec = Object.assign({}, record); // Assign the an empty object with the same properties of the apex returned record  
                        //Add a new propertie and search by ignore case and the value it will be bold.
                        tempRec.formattedName = tempRec.Value.replace(new RegExp(this.searchKey, 'i'), (value) => `<b>${value}</b>`);
                        tempfunds.push(tempRec);

                    });
                    this.funds = tempfunds;

                })
                .catch(error => {

                    console.log('Error Occured', JSON.stringify(error));
                    this.error = error;

                });

        } else {

            this.funds = undefined;

        }

    }

    handleSelect(event) {

        let strIndex = event.currentTarget.dataset.id;
        console.log('strIndex is', strIndex);
        let tempRecs = JSON.parse(JSON.stringify(this.funds));
        let selectedFundName = tempRecs[strIndex].Value;
        let strAccName = tempRecs[strIndex].Name;
        this.selectedFunds = selectedFundName;
        this.searchKey = strAccName;
        this.funds = undefined;

    }

    handleSuccess() {
        const evt = new ShowToastEvent({
            title: 'Trust Fund Saved',
            message: 'Operation sucessful',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);

        const inputFields = this.template.querySelectorAll(
            '.resetField'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }

        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
        }, 2000);

        this.page = 1;
        this.startingRecord = 1;
        refreshApex(this.wiredFunds);
        this.previousHandler();
        this.isModalOpen = false;
    }

    handleSuccessEdit() {
        const evt = new ShowToastEvent({
            title: 'Trust Fund Edited',
            message: 'Operation sucessful',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);

        const inputFields = this.template.querySelectorAll(
            '.resetField'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }

        this.isLoading = true;
        this.creationForm = true;
        this.recordEditForm = false;
        setTimeout(() => {
            this.isLoading = false;
        }, 2000);
        this.page = 1;
        this.startingRecord = 1;
        refreshApex(this.wiredFunds);
        this.previousHandler();
        this.isModalOpen = false;
    }

    handleError(event) {

        console.log(JSON.stringify(event));
        const evt = new ShowToastEvent({
            title: 'Error',
            message: 'Operation Failed due to ' + event.detail.detail,
            variant: 'error',
            mode: 'dismissable'
        });

        this.dispatchEvent(evt);
    }

    handleErrorEdit(event) {

        console.log(JSON.stringify(event));
        const evt = new ShowToastEvent({
            title: 'Error',
            message: 'Operation Failed due to ' + event.detail.detail,
            variant: 'error',
            mode: 'dismissable'
        });

        this.dispatchEvent(evt);
    }

    callRowAction(event) {

        this.editRecordId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        console.log('Action Name', actionName);
        if (actionName === 'Edit') {
            this.modalLabel = 'Edit ' + this.label;
            this.recordEditForm = true;
            this.isModalOpen = true;
            this.creationForm = false;

        } else if (actionName === 'View') {
            const completeURL = `${window.location.origin}/${this.editRecordId}`;
            window.open(completeURL, this.target);
        } else {
            deleteRecord(this.editRecordId).then(() => {
                this.isLoading = true;
                setTimeout(() => {
                    this.isLoading = false;
                }, 2000);
                this.page = 1;
                this.startingRecord = 1;
                refreshApex(this.wiredFunds);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: "Record deleted successfully!",
                        variant: 'success'
                    })
                );
            }).catch((error) => {
                console.log("error, " + error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            })
        }
    }
}