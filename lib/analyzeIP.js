/**
 *
 * Created by pavelnovotny on 03.10.17.
 */

module.exports.processChunk = analyzeIP;

var check_bs = {
    "BusinessService$RADIUS_TimePackagesManagement$1.0$BusinessServices$bs_RADIUS_TimePackagesManagement_WS" : true,
    "BusinessService$RADIUS_RoamingDataPackagesManagement$1.0$BusinessServices$bs_RADIUS_RoamingDataPackagesManagement_WS" : true,
    bs_RADIUS_ISPRadiusProvisioning_WS : true,
    bs_RADIUS_InternetInMobile_WS : true,
    "BusinessService$NWFUP_FUPProvisioning$1.0$BusinessServices$bs_NWFUP_FUPRovisioning_WS" : true,
    "BusinessService$KFA_DPIProvisioning$1.0$BusinessServices$bs_KFA_DPIProvisioning_WS" : true
}


function analyzeIP(timeLogChunk) {
    var rec = timeLogChunk.split("\n[");
    rec.map(function (item) {
        var services = item.split("]\n");
        var technologicalServiceItems = services[0].split(";");
        var proxy = technologicalServiceItems[1];
        var ip = technologicalServiceItems[23];
        services.map(function (serviceItem) {
            var items = serviceItem.split(";");
            var service = items[1];
            if (check_bs[service]) {
                console.log("" + ip + " " + service + " " + proxy);
            }
        });
    });
}
