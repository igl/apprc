/* @flow */

const injectEnvVariables = (str:string, vars:Object) => {
    Object.keys(vars).forEach(key => {
        str = str.replace(new RegExp('{ *' + key + ' *}', 'gi'), vars[key]);
    });

    return str;
};

export default injectEnvVariables;
