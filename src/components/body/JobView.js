
'use strict';

import React, {Component} from 'react';
import ValueGroup from '../util/ValueGroup.js'
import XEditableText from "../Enhanced/XEditableText.js";
import {Grid, Row,Col,Button,DropdownButton,MenuItem,Panel,Nav,NavItem,PanelGroup,Label,Accordion} from 'react-bootstrap';
var _ = require('lodash');

var global=window;

class StringItem extends Component{

	 onChange(key,val){
        console.log('StringItem+'+val);
        console.dir(this.props);
        this.props.list[this.props.idx]=val;
        this.props.data=val;
        //this.setState({});
    }

    onSelectChange(){
        if(this.props.onSelectChange){
            this.props.onSelectChange(this.props.idx);
        }        
    }

    render(){
       var item=this.props.data;
        var idx=this.props.idx;
         var wh=4;
        var cps={xs:wh,sm:wh,md:wh,lg:wh};
        return (
        		<Col {...cps}><Button onClick={this.onSelectChange.bind(this)}>值{idx}</Button>
        			<XEditableText id={'value_'} title='字符串' val={item} onChange={this.onChange.bind(this)}/>
        		</Col>);
    }
}

class StringList extends Component{

	renderItems(){
    	var list=this.props.list;        
        var onSelectChange=this.props.onSelectChange;
    	var arr=[];
    	var idx=0;
    	list.map(function(item){
                    arr.push(
                            <StringItem list={list} data={item} idx={idx++} onSelectChange={onSelectChange}/>
                            )
                        });
    	return arr;
    }

    render(){    	
        return (        	     	
            <Panel {...this.props} bsStyle="warning">
            	<Row>
            	{
            		this.renderItems()
            	}
            	</Row>
            </Panel>            
        );
    }
}

class JobItem extends Component{

    onChange(key,val){
        var vo=this.props.data;
        vo[key]=val;
        this.setState({});
    }

    onClickCall(){
        if(this.props.onSelectChange){
            this.props.onSelectChange(this.props.idx);
        }
    }

    onSelectChange(e){
        e.preventDefault();        
        if(this.props.onSelectChange){
            this.props.onSelectChange(this.props.idx);
        }
        this.props.expanded=!this.props.expanded; 
        this.setState({});    
    }

    createSonJobFunc(idx,cb){
        //弹对话框
        var act="";
        var handleSelect=function(key){
            act=key;
        }
         var vo=this.props.data;
        var list=vo.sons;
        var ps={           
            okHandler:function(){
                console.log('select act',act);
                if(act!=""){
                    global.cfgs.createJobByType(list,idx,act);
                    cb();
                }
            },
            cancelHandler:function(){

            },
            renderHeader:function(){
                return <h1>选择内容项</h1>
            },

            renderBody:function(){
                var cfgs=global.cfgs.getSonTypes(vo.type);
                return (

                    <Nav bsStyle="pills" onSelect={handleSelect}>
                        {
                            cfgs.map(function(item){
                                return <NavItem eventKey={item.type} >{item.name}</NavItem>
                            })
                        }                     
                    </Nav>
                    );                 
                
            }

        }

       global.showPop(ps);
    }

    render(){
        var item=this.props.data;
        
        
        var arr=[];
        var filters=this.props.viewFilters;
        var wh=3;
        var cps={xs:wh,sm:wh,md:wh,lg:wh};
        for(var key in item){
        	if(filters[key]==null){
        		continue;
        	}
            var val=item[key];
            if(key=='sons'){            	
       			var ps={};
        		ps.list=item.sons;
        		ps.creatorAsync=this.createSonJobFunc.bind(this);
        		ps.renderClazz=JobView;

        		arr.push( <ul><ValueGroup {...ps}></ValueGroup></ul>)
            }else if(_.isArray(val)){
       			var ps={};
        		ps.list=val;
        		ps.creator='';
        		ps.renderClazz=StringList;
        		ps.header=filters[key];
            	arr.push(
            		<ul><ValueGroup {...ps}></ValueGroup></ul>
            		)
            }else{
            	arr.push( 
                    <Col {...cps}><Label>{filters[key]}:</Label><XEditableText id={key} title={filters[key]} val={val} onChange={this.onChange.bind(this)}/></Col>
                    );
            }
                       
        }
        //global.log("render jobview",this.props.idx);
        //<Row>{arr}</Row>defaultExpanded={true} expanded={true}
    return (<Panel header={item.name+"--::--"+item.desc} eventKey={this.props.idx} collapsible={true} expanded={this.props.expanded} onClick={this.onClickCall.bind(this)} onSelect={this.onSelectChange.bind(this)}>
        			<Row>{arr}</Row>
                </Panel>);
                
    }
}

class JobView extends Component{

	renderItems(){
    	var list=this.props.list;        
        var onSelectChange=this.props.onSelectChange;
    	var arr=[];
    	var idx=0;
    	list.map(function(item){
                    var viewFilters=global.cfgs.getViewFilter(item.type);
                    arr.push(
                            <JobItem data={item} idx={idx++} viewFilters={viewFilters} expanded={true} onSelectChange={onSelectChange}/>
                            )
                        });
    	return arr;
    }
//Accordion
    render(){    	
        return (        	
            <div >
            	{
            		this.renderItems()
            	}
            </div>
        );
    }
	
}

export default JobView;