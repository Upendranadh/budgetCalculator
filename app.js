// Budget controller

var budgetController =(function(){

   var Expenses=function(id,descripton,value){
      this.id=id;
      this.descripton=descripton;
      this.value=value;
      this.percentage=-1;;

   };
   Expenses.prototype.calcPercentage=function(totalIncome){
     if(totalIncome){
      this.percentage= Math.round((this.value/totalIncome)*100);
     }
     else{
      this.percentage=-1;
     }
    };
    Expenses.prototype.getPercentage=function(){
      return this.percentage;
    };
   var Income=function(id,descripton,value){
    this.id=id;
    this.descripton=descripton;
    this.value=value;
 };
  var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach (function(current){
           sum+=current.value;

        });
        data.totals[type]=sum;

  };
  var data={
    allItems:{
      exp:[],
      inc:[]
    },
    totals:{
      exp:0,
      inc:0 
    },
    budget:0,
    percentage:-1
  };

  return {
    addItem:function(type,des,val){
      var addItem,ID,totExp,totInc;

      if(data.allItems[type].length>0)
      {
        //create new id
        ID=data.allItems[type][data.allItems[type].length-1].id+1;
      }
      else
      {
              ID=0;
      }
      //create new item based on inc or exp type
         if(type==='exp')
         {
            addItem=new Expenses(ID,des,val);
         }
         else if(type=='inc')
         {
            addItem=new Income(ID,des,val);
         }

         //push new elemnt to array
         data.allItems[type].push(addItem);

         return addItem;
    },
    deleteItem:function(type,id){
      /*
      The below code does not work because if some ID get deleted the array position changes
      var delItem;
         if(type==='inc'){
          delItem= data.allItems[type][id];
         }

         else if(type==='exp'){
          
          delItem= data.allItems[type][id];

         }
         data.allItems[type].pop(delItem);
         return{
          delItem
         }
         */
       var ids, index;
       ids=data.allItems[type].map(function(current){
            return current.id
       });

       index=ids.indexOf(id);
       if(index!== -1 ){
         data.allItems[type].splice(index,1);
       }

    },
    testing:function(){
      console.log(data);
    },
    calculateBudget:function(){
           //1.update exp and inc
           calculateTotal('exp');
           calculateTotal('inc');

          //2.calculate budget inc-exp
          data.budget=data.totals.inc-data.totals.exp;

          //3.calculate the Percentage
          if(data.totals.inc>0)
          {
            data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
          }
          else{
            data.percentage=-1;
          }
         

    },
    calculatePercentage:function(){
       data.allItems.exp.forEach(function(cur){
         cur.calcPercentage(data.totals.inc);

       });
    },
    getPercentages:function(){
      var allPerc=data.allItems.exp.map(function(cur) {
          return cur.getPercentage();

      });
      return allPerc;
    },
   
    getBudget:function(){
      return{
        budget:data.budget,
        totExpense:data.totals.exp,
        totIncome:data.totals.inc,
        percentage:data.percentage

      };
    }
  };

})();





//UI controller
var UIController=(function(){

  var domStrings={
    inputType:'.add__type',
    inputDescription:'.add__description',
    inputValue:'.add__value',
    inputAddbutton:'.add__btn',
    incomeContainer:'.income__list',
    expenseContainer:'.expenses__list',
    inputBudget:'.budget__value',
    inputIncome:'.budget__income--value',
    inputExpense:'.budget__expenses--value',
    inputpercentage:'.budget__expenses--percentage',
    container:'.container',
    expensesPercLabel:'.item__percentage',
    displaymonth:'.budget__title--month'
  };
  var formatNumber=function(number,type){
    var numberSplit,int,dec;
      /*
          1. + or - before the number
             exactly 2 decimal points 
             coma seperating thousands
             
             2310.4567--> +2,310.46
             2000-------> +2,000.00
         */
        number=Math.abs(number);
        number=number.toFixed(2);

        numberSplit=number.split('.');

        int=numberSplit[0];
        if(int.length>3){
          int =int.substr(0,int.length-3) +',' + int.substr(int.length-3,3);
        }

        dec=numberSplit[1];
        return (type==='exp' ? '-' : '+') +' ' + int + '.'+ dec;
       };
       var calMonth=function(num){
           switch(num){
              case 0: 
              return 'jan';
              break;
              case 1: 
              return 'feb';
              break;
              case 2: 
              return 'mar';
              break;
              case 3: 
              return 'apr';
              break;
              case 4: 
              return 'may';
              break;
              case 5: 
              return 'jun';
              break;
              
           }
          
       };
       var nodeListForeach =function(list,callback) {
              for(var i=0;i<list.length;i++)
              {
                callback(list[i],i);
              }
           };

    return {
        getInput:function(){

            return{
                 type: document.querySelector(domStrings.inputType).value,// will be either inc(+) or exp(-)
                 description: document.querySelector(domStrings.inputDescription).value,
                 value: parseFloat(document.querySelector(domStrings.inputValue).value)
                  

            };
        },
        addListItem:function(obj,type){
          var html,newHtml,element;
          //create a HTML string with placeholder text
          if(type ==='inc')
          {
            element=domStrings.incomeContainer;
            html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">  <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>';
          }else if(type ==='exp'){
            element=domStrings.expenseContainer;
             html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
          }
          //Replace Placeholder text with some actual data
          newHtml=html.replace('%id%',obj.id);
          newHtml=newHtml.replace('%description%',obj.descripton);
          newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

          //insert the HTML in to DOM 
          document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        clearFields : function(){
         var fields,feildArray;

         fields=document.querySelectorAll(domStrings.inputDescription + ", " + domStrings.inputValue);
         
         feildArray=Array.prototype.slice.call(fields);
         feildArray.forEach(function(current, index, array){
           current.value = "";
         
          });
      
         feildArray[0].focus();


        },
        updateBudgetToUi:function(budget){
          var type;
          budget.budget>0 ? type='inc' : type= 'exp';
            // step1:update income
            document.querySelector(domStrings.inputIncome).textContent= formatNumber(budget.totIncome,'inc');

            // step2:update expense
            document.querySelector(domStrings.inputExpense).textContent= formatNumber(budget.totExpense,'exp');


            // step3:update budget
          
              document.querySelector(domStrings.inputBudget).textContent=formatNumber(budget.budget,type);

            // step4:update the percentage
            if(budget.percentage>0){
              document.querySelector(domStrings.inputpercentage).textContent=budget.percentage+'%';

              // document.querySelector(domStrings.inputItemPercentage).textContent=budget.percentage+'%';
            }

            else{
              document.querySelector(domStrings.inputpercentage).textContent='----';

              // document.querySelector(domStrings.inputItemPercentage).textContent='----';
            }
           },
           deleteItemInUI:function(selectorID){
            var element=document.getElementById(selectorID);
            element.parentNode.removeChild(element);
  
           },

        displayPercentage:function(percentages){
           var feilds=document.querySelectorAll(domStrings.expensesPercLabel);

           

           nodeListForeach(feilds,function(current,index){

            if(percentages[index]>0){
              current.textContent=percentages[index]+'%';
            }
            else{
              current.textContent='----';
            }
             
           });
        },
        displayMonth: function(){
          var now,year,monthNum,month
             now=new Date();
             year=now.getFullYear();
             monthNum=now.getMonth();
             month = calMonth(monthNum);
             console.log(month);
            document.querySelector(domStrings.displaymonth).textContent= month + ' ' + year ;

        },
        changedType:function(){
          var feilds=document.querySelectorAll(
            domStrings.inputType +','+
            domStrings.inputDescription +','+
            domStrings.inputValue
            );
            nodeListForeach(feilds,function(cur)
            {
               cur.classList.toggle('red-focus');
            });
           document.querySelector(domStrings.inputAddbutton).classList.toggle('red');
        },
        
        getDomStrings:function(){
            return domStrings;
        }


    };

})();





//Global   APP controller
var controller=(function(budgetCtrl,UICtrl){
  
  var setUpEventListeners=function(){
    var input;
    var  DOM = UIController.getDomStrings();
    document.querySelector(DOM.inputAddbutton).addEventListener('click',ctrlAdditem);
    document.addEventListener('keypress',function(event){
                if(event.keyCode===13 || event.Which===13)
                {
                  ctrlAdditem();
                }
    });   
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change',UIController.changedType);
  };
 

  var updateBudget=function(){
      //1.calculate the budget
      budgetController.calculateBudget();

      //2.return budget
      var budget =budgetController.getBudget();

      //3.Display the budget on the UI
      // console.log(budget);
      UIController.updateBudgetToUi(budget);

  };
  var updatePercentage=function(){
          // 1.calculate the percentage and 2.Read the percentage 
         budgetController.calculatePercentage();
    
         //2.Read the percentage   
           
         var percentages=budgetController.getPercentages();
           // 3.update the UI with percentages
    UIController.displayPercentage(percentages);



  };

  var ctrlAdditem=function(){
      //1. get the feild input data
      input= UIController.getInput();
     
      if(input.description!== "" && !isNaN(input.value) && input.value >0 )
      {
           //  console.log(input.description);
      //2. Add the item to the budget controller
      var newItem=budgetController.addItem(input.type,input.description,input.value);

      //3. add the item to UI
      var addNewItem=UIController.addListItem(newItem,input.type);
      //4. Clear the feilds
      UIController.clearFields();

      //5.update budget
      updateBudget();
       

       //6.calculates and updates the percentage

       updatePercentage();
      }
     
  };

  var ctrlDeleteItem=function(event){
     var itemId,splitId,type,ID,delItem;
    itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitId=itemId.split('-');
    type=splitId[0];
    ID=parseInt(splitId[1]);
   
    // 1. Delete the item from data structure
       delItem= budgetController.deleteItem(type,ID);


      // 2. Delete the item from UI
      
      UIController.deleteItemInUI(itemId);

      //3.Update and show the new budget
      
        updateBudget();

      //4.calculates and  Updates the percentage

      updatePercentage();
    
    
  }




  return {
    init:function(){
      console.log('application has started');
      UIController.displayMonth();
      UIController.updateBudgetToUi({
        budget:0,
        totExpense:0,
        totIncome:0,
        percentage:-1

      });
      setUpEventListeners();
      
    }
  }
 

})(budgetController,UIController);


controller.init();