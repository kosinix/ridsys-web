// Define a new component
if (typeof VuePasswordHelpers === 'undefined') {
    function VuePasswordHelpers() { } // Goes to window.VuePhAddress
}
/**
 * Usage:
 * mixins: [
 *      VuePasswordHelpers.mixinHideShow
 * ],
 */
VuePasswordHelpers.mixinHideShow = {
    // Same-name data are overwritten
    data: function () {
        return {
            passwordType: 'password'
        }
    },
    methods: {
        togglePassword: function(){
            if(this.passwordType === 'password'){
                this.passwordType = 'text';
            } else {
                this.passwordType = 'password';
            }
        },
    }
}
