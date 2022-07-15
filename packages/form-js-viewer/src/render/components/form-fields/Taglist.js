import { useContext, useEffect, useRef, useState, useCallback } from 'preact/hooks';

import { FormContext } from '../../context';

import CloseIcon from './icons/Close.svg';

import Description from '../Description';
import Errors from '../Errors';
import Label from '../Label';

import {
  formFieldClassesCustom,
  prefixId
} from '../Util';

import classNames from 'classnames';

import DropdownList from './parts/DropdownList';

const type = 'taglist';


export default function Taglist(props) {
  const {
    disabled,
    errors = [],
    field,
    value : values = []
  } = props;

  const {
    description,
    id,
    label,
	dataSource,
    values : options,
	hiddenFx
  } = field;

  const { formId } = useContext(FormContext);
  const [ filter, setFilter ] = useState('');
  const [ selectedValues, setSelectedValues ] = useState([]);
  const [ filteredValues, setFilteredValues ] = useState([]);
  const [ isDropdownExpanded, setIsDropdownExpanded ] = useState(false);
  const [ hasValuesLeft, setHasValuesLeft ] = useState(true);
  const [ escapeClose, setEscapeClose ] = useState(false);
  const searchbarRef = useRef();

  const [myOptions, myOptionsSet] = useState([]);

  const fetchMyAPI = useCallback(async () => {
      if (dataSource && dataSource.length>0) {
		  let response = await fetch(dataSource);
		  response = await response.json();
		  myOptionsSet(response);
	  } else {
		  myOptionsSet(options);
	  }
  }, [dataSource]) // if dataSource changes, useEffect will run again

  useEffect(() => {
    fetchMyAPI()
  }, [fetchMyAPI])

  // Usage of stringify is necessary here because we want this effect to only trigger when there is a value change to the array
  useEffect(() => {
    const selectedValues = values.map(v => myOptions.find(o => o.value === v)).filter(v => v !== undefined);
    setSelectedValues(selectedValues);
  }, [ JSON.stringify(values), myOptions ]);

  useEffect(() => {
    setFilteredValues(myOptions.filter((o) => o.label && (o.label.toLowerCase().includes(filter.toLowerCase())) && !values.includes(o.value)));
  }, [ filter, JSON.stringify(values), myOptions ]);

  useEffect(() => {
    setHasValuesLeft(selectedValues.length < myOptions.length);
  }, [ selectedValues.length, myOptions.length ]);

  const onFilterChange = ({ target }) => {
    setEscapeClose(false);
    setFilter(target.value);
  };

  const selectValue = (option) => {
    setFilter('');
    props.onChange({ value: [ ...values, option.value ], field });
  };

  const deselectValue = (option) => {
    props.onChange({ value: values.filter((v) => v != option.value), field });
  };

  const onInputKeyDown = (e) => {

    switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':

      // We do not want the cursor to seek in the search field when we press up and down
      e.preventDefault();
      break;
    case 'Backspace':
      if (!filter && selectedValues.length) {
        deselectValue(selectedValues[selectedValues.length - 1]);
      }
      break;
    case 'Escape':
      setEscapeClose(true);
      break;
    case 'Enter':
      if (escapeClose) {
        setEscapeClose(false);
      }
      break;
    }
  };

  return <div class={ formFieldClassesCustom(type, hiddenFx, errors) }>
    <Label
      label={ label }
      id={ prefixId(id, formId) } />
    <div class={ classNames('fjs-taglist', { 'disabled': disabled }) }>
      {!disabled &&
        selectedValues.map((sv) => {
          return (
            <div class="fjs-taglist-tag" onMouseDown={ (e) => e.preventDefault() }>
              <span class="fjs-taglist-tag-label">
                {sv.label}
              </span>
              <span class="fjs-taglist-tag-remove" onMouseDown={ () => deselectValue(sv) }><CloseIcon /></span>
            </div>
          );
        })
      }
      <input
        disabled={ disabled }
        class="fjs-taglist-input"
        ref={ searchbarRef }
        id={ prefixId(`${id}-search`, formId) }
        onChange={ onFilterChange }
        type="text"
        value={ filter }
        placeholder={ 'Search' }
        autoComplete="off"
        onKeyDown={ (e) => onInputKeyDown(e) }
        onMouseDown={ () => setEscapeClose(false) }
        onFocus={ () => setIsDropdownExpanded(true) }
        onBlur={ () => { setIsDropdownExpanded(false); setFilter(''); } } />
    </div>
    <div class="fjs-taglist-anchor">
      {!disabled && isDropdownExpanded && !escapeClose && <DropdownList
        values={ filteredValues }
        getLabel={ (v) => v.label }
        onValueSelected={ (v) => selectValue(v) }
        emptyListMessage={ hasValuesLeft ? 'No results' : 'All values selected' }
        listenerElement={ searchbarRef.current } />}
    </div>
    <Description description={ description } />
    <Errors errors={ errors } />
  </div>;
}

Taglist.create = function(myOptions = {}) {
  return {
    values: [
      {
        label: 'Value',
        value: 'value'
      }
    ],
    ...myOptions
  };
};

Taglist.type = type;
Taglist.label = 'Taglist';
Taglist.keyed = true;
Taglist.emptyValue = [];
Taglist.hiddenFx = 'false';
