import { useContext } from 'preact/hooks';

import { FormContext } from '../../context';

import Description from '../Description';
import Errors from '../Errors';
import Label from '../Label';

import {
  formFieldClasses,
  formFieldClassesCustom,
  prefixId
} from '../Util';

const type = 'fileUpload';


export default function FileUpload(props) {
  const {
    disabled,
    errors = [],
    field,
    value = ''
  } = props;

  const {
    description,
    id,
    label,
	hiddenFx,
    validate = {}
  } = field;

  const { required } = validate;

  const onChange = ({ target }) => {
    props.onChange({
      field,
      value: target.value
    });
  };

  const { formId } = useContext(FormContext);

  return <div class={ formFieldClassesCustom(type, hiddenFx, errors) }>
    <Label
      id={ prefixId(id, formId) }
      label={ label }
      required={ required }
	  />
    <input
      class="fjs-input"
      disabled={ disabled }
      id={ prefixId(id, formId) }
      onInput={ onChange }
      type="date"
      value={ value } />
    <Description description={ description } />
    <Errors errors={ errors } />
  </div>;
}

FileUpload.create = function(options = {}) {
  return {
    ...options
  };
};

FileUpload.type = type;
FileUpload.label = 'File Upload';
FileUpload.keyed = true;
FileUpload.emptyValue = '';
FileUpload.hiddenFx = 'false';