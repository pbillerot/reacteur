/**
 * ToolsUI
 * 
 */
import Alert from 'react-s-alert';

const sprintf = require('sprintf-js').sprintf
const ToolsUI = {
    showAlert(alerts) {
        //console.log("MESSAGES", alerts)
        if (alerts) {
            alerts.forEach(alert => {
                //console.log("MESSAGE", alert)
                switch (alert.type) {
                    case 'info':
                        Alert.info(alert.message)
                        break;
                    case 'warning':
                        Alert.warning(alert.message)
                        break;
                    case 'error':
                        Alert.error(alert.message)
                        break;
                    case 'success':
                        Alert.success(alert.message)
                        break;
                    default:
                        Alert.info(alert.message)
                        break;
                }
            })
        }
    },
    saveAlert(alerts) {
        console.log("saveAlerts", alerts)
        window.localStorage.setItem("alerts", alerts);
    },
}
export { ToolsUI }