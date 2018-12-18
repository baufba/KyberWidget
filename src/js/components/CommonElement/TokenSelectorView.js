import React from "react"
import * as converter from "../../utils/converter"
import Dropdown, { DropdownTrigger, DropdownContent } from "react-simple-dropdown";
import {addPrefixClass} from "../../utils/className"
import { default as _ } from "underscore";
import { getTokenUrl } from "../../utils/common";

const TokenSelectorView = (props) => {
  var focusItem = props.listItem[props.focusItem]
  var listShow = {};
  let priorityTokens = [];

  Object.keys(props.listItem).map((key) => {
    var token = props.listItem[key],
        matchName = token.name.toLowerCase().includes(props.searchWord),
        matchSymbol = token.symbol.toLowerCase().includes(props.searchWord);

    if (matchSymbol || matchName) {
      listShow[key] = props.listItem[key];
    }

    if (token.priority) {
      priorityTokens.push(token);
    }
  });

  priorityTokens = _.sortBy(priorityTokens, function(token) { return token.index; });

  var getListToken = () => {
    return Object.keys(listShow).map((key) => {
      if (key === props.focusItem) {
        return;
      }

      var item = listShow[key];
      var sourceSymbol = props.type === 'source'?item.symbol:props.exchange.sourceTokenSymbol
      var destSymbol = props.type === 'source'?props.exchange.destTokenSymbol: item.symbol
      const sourceRate = sourceSymbol === "ETH" ? 1 : converter.toT(props.tokens[sourceSymbol].rate, 18);
      const destRate = destSymbol === "ETH" ? 1 : converter.toT(props.tokens[destSymbol].rateEth, 18);
      const rate = sourceSymbol === destSymbol ? 1 : converter.roundingNumber(sourceRate * destRate);

      return (
        <div
          key={key}
          onClick={(e) => props.selectItem(e, item.symbol, item.address)}
          className={addPrefixClass("token-item-container theme-text-hover")}>
          <div className={addPrefixClass("token-item-content")}>
            <div className={addPrefixClass("token-item")}>
              <img className={addPrefixClass("token-item__icon")} src={getTokenUrl(item.symbol)}/>
              <span className={addPrefixClass("token-item__symbol")}>{item.symbol}</span>
            </div>

            <div className={addPrefixClass("token-item")}>
              <div className={addPrefixClass("token-item__rate")}>
                <div>1 {sourceSymbol} = {rate} {destSymbol}</div>
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className={addPrefixClass("token-chooser")}>
      <Dropdown className={addPrefixClass("token-dropdown")} onShow = {(e) => props.showTokens(e)} onHide = {(e) => props.hideTokens(e)} active={props.open}>
        <DropdownTrigger className={addPrefixClass("notifications-toggle token-dropdown__trigger")}>
          <div className={addPrefixClass("token-chooser__selector theme-border")}>
            <img className={addPrefixClass("token-chooser__token-icon")} src={getTokenUrl(focusItem.symbol)} />
            <div className={addPrefixClass("token-chooser__token-symbol")}>{focusItem.symbol}</div>
            <div className={addPrefixClass('common__triangle theme-border-top ' + (props.open ? 'up' : ''))}/>
          </div>
        </DropdownTrigger>
        <DropdownContent className={addPrefixClass("token-dropdown__content")}>
          <div className={addPrefixClass("select-item")}>
            {priorityTokens.length > 0 &&
            <div className={addPrefixClass("suggest-item")}>
              {priorityTokens.map((token, i) => {
                return (
                  <div className={addPrefixClass("suggest-item__content")} key={i} onClick={(e) => props.selectItem(e, token.symbol, token.address, "suggest")}>
                    <img className={addPrefixClass("suggest-item__icon")} src={getTokenUrl(token.symbol)} />
                    <div className={addPrefixClass("suggest-item__symbol")}>{token.symbol}</div>
                  </div>
                )
              })}
            </div>
            }
            <div className={addPrefixClass("search-item")}>
              <input value={props.searchWord} placeholder='Try "DAI"' onChange={(e) => props.changeWord(e)} type="text" onFocus={(e) => props.analytics.callTrack("searchToken", props.type)}/>
            </div>
            <div className={addPrefixClass("list-item")}>
              <div className={addPrefixClass("list-item__content")}>
                {getListToken()}
              </div>
            </div>
          </div>
        </DropdownContent>
      </Dropdown>
    </div>
  )
};

export default TokenSelectorView
