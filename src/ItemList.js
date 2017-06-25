import React from 'react';

import TextField from 'material-ui/TextField';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentClear from 'material-ui/svg-icons/content/clear';
import FlatButton from 'material-ui/FlatButton';

import {List, ListItem} from 'material-ui/List';

const FABstyle = {
  position: 'fixed',
  right: '20px',
  bottom: '20px',
};

const LS_KEY = "ilState";

class ItemList extends React.Component {
  constructor(props) {
    super(props);

    this.state = null;
    try {
      this.state = JSON.parse(localStorage.getItem(LS_KEY));
    } catch(e) {}

    if (this.state === null) {
      this.state = {
        finalVolume: '',
        items: [],
        needBlank: 0.0,
      };
    }
  }

  componentDidUpdate(props, state) {
    const stateAsJSON = JSON.stringify(this.state);
    localStorage.setItem(LS_KEY, stateAsJSON);
  }

  render() {
    const content = (this.state.items.length === 0)
      ? this.renderNoItemMessage()
      : this.renderItems()
    return (
      <div>
        <div className="topBar">
          <h2>Final volume:</h2>
          <TextField
            className="finalVolume"
            hintText="e.g. 10"
            errorText={this.nanError(this.state.finalVolume)}
            value={this.state.finalVolume}
            onChange={this.handleFinal.bind(this)}
          />
        </div>
        {content}
        <FloatingActionButton style={FABstyle} onTouchTap={this.handleAdd.bind(this)}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
    );
  }

  renderNoItemMessage() {
    return (
      <List>
        <ListItem className="addSome" primaryText="Add some substances!" />
      </List>
    );
  }

  renderItems() {
    let blank = parseFloat(this.state.finalVolume) || 0.0;
    const renderedItems = this.state.items.map((item, i) => {
      blank -= parseFloat(item.need) || 0.0;
      return this.renderItem(item, i);
    });

    return (
      <List>
        <ListItem key={"t"} className="item header">
          <div>Name</div>
          <div>Have</div>
          <div>Want</div>
          <div>Use</div>
          <div className="deleteSpacer" />
        </ListItem>
        {renderedItems}
        {this.renderBlank(blank)}
      </List>
    );
  }

  renderItem(item, index) {
    const changeHandler = this.handleChange.bind(this);
    const deleteButtonStyle = {
      width: '28px',
      minWidth: '28px',
    };
    return (
      <ListItem key={index} className="item">
        <TextField
          name={"in" + index}
          className="itemName"
          hintText="unnamed"
          value={item.name}
          onChange={changeHandler}
        />
        <TextField
          name={"ih" + index}
          className="itemConc"
          value={item.cHave}
          errorText={this.nanError(item.cHave)}
          onChange={changeHandler}
        />
        <TextField
          name={"iw" + index}
          className="itemAmt"
          value={item.cWant}
          errorText={this.nanError(item.cWant)}
          onChange={changeHandler}
        />
        <TextField
          name={"in" + index}
          disabled={true}
          className="itemNeed"
          value={Number(item.need).toFixed(6)}
        />
        <FlatButton
          icon={<ContentClear />}
          secondary={true}
          style={deleteButtonStyle}
          onTouchTap={this.handleRemove.bind(this, index)}
        />
      </ListItem>
    )
  }

  renderBlank(blankAmt) {
    return (
      <ListItem className="item">
        <TextField
          name="blankName"
          disabled={true}
          className="itemBlankName"
          value="Blank"
        />
        <TextField
          name="blankAmt"
          disabled={true}
          className="itemBlankAmt"
          value={Number(blankAmt).toFixed(6)}
          errorText={blankAmt < 0 ? 'Not enough' : ''}
        />
        <div className="deleteSpacer" />
      </ListItem>
    );
  }

  ///

  handleFinal(event, newFinal) {
    this.setState({
      finalVolume: newFinal,
      items: this.calcNeed(this.state.items, newFinal),
    });
  }

  handleRemove(idx) {
    console.log(idx);
    let items = [...this.state.items];
    items.splice(idx, 1);
    this.setState({
      items: this.calcNeed(items),
    });
  }

  handleAdd() {
    const newItem = {
      name: '',
      cHave: 1.0,
      cWant: 1.0,
      need: 0.0,
    }
    this.setState({items: this.calcNeed([...this.state.items, newItem])});
  }

  handleChange(event, newValue) {
    const newItems = [...this.state.items];

    const type = event.target.name.substring(0, 2);
    const idx = event.target.name.substring(2) | 0;
    if (type === 'in') {
      newItems[idx].name = newValue;
    } else if (type === 'ih') {
      newItems[idx].cHave = newValue;
    } else if (type === 'iw') {
      newItems[idx].cWant = newValue;
    }
    this.setState({items: this.calcNeed(newItems)});
  }

  calcNeed(newItems, newFinal) {
    const final = parseFloat(newFinal || this.state.finalVolume);
    if (isNaN(final)) {
      return newItems;
    }

    return newItems.map(item => {
      const want = parseFloat(item.cWant);
      const have = parseFloat(item.cHave);
      if (isNaN(want) || isNaN(have) || have === 0.0) {
        return {
          ...item,
          need: 0.0,
        };
      }
      return {
        ...item,
        need: final * want / have,
      };
    });
  }

  nanError(x) {
    return parseFloat(x) === +x ? '' : 'Not a number';
  }
}

export default ItemList;
