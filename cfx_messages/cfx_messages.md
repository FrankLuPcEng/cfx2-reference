# CFX Messages 整理

Source: https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/R_Project_CFXSDK.htm
Messages scraped / 訊息數: 183

## Counts by Namespace / 依 Namespace 統計

| Namespace | Count |
|---|---:|
| CFX | 10 |
| CFX.InformationSystem.DataTransfer | 2 |
| CFX.InformationSystem.OperatorValidation | 2 |
| CFX.InformationSystem.ProductionScheduling | 2 |
| CFX.InformationSystem.TopicValidation | 2 |
| CFX.InformationSystem.UnitValidation | 2 |
| CFX.InformationSystem.WorkOrderManagement | 5 |
| CFX.Maintenance | 12 |
| CFX.Materials.Management | 13 |
| CFX.Materials.Management.MSDManagement | 5 |
| CFX.Materials.Storage | 10 |
| CFX.Materials.Transport | 10 |
| CFX.Production | 46 |
| CFX.Production.Application | 2 |
| CFX.Production.Application.Solder | 1 |
| CFX.Production.Assembly | 3 |
| CFX.Production.Assembly.PressInsertion | 3 |
| CFX.Production.Hermes | 6 |
| CFX.Production.LoadingAndUnloading | 2 |
| CFX.Production.Processing | 1 |
| CFX.Production.ReworkAndRepair | 1 |
| CFX.Production.TestAndInspection | 4 |
| CFX.ResourcePerformance | 26 |
| CFX.ResourcePerformance.PressInsertion | 1 |
| CFX.ResourcePerformance.SMTPlacement | 1 |
| CFX.ResourcePerformance.SolderPastePrinting | 6 |
| CFX.ResourcePerformance.THTInsertion | 1 |
| CFX.Sensor.Identification | 4 |

## Counts by Kind / 依類型統計

| Kind | Count |
|---|---:|
| Event/Notification | 98 |
| Request | 42 |
| Response | 43 |

## Message Index / 訊息索引

### CFX

| Message | Kind | Description |
|---|---|---|
| [AreYouThereRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_AreYouThereRequest.htm) | Request | Allows any CFX endpoint to determine if another particular CFX endpoint is present on a CFX network. The response sends basic information about the endpoint, including its CFX Handle, and network hostname / address. |
| [AreYouThereResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_AreYouThereResponse.htm) | Response | Allows any CFX endpoint to determine if another particular CFX endpoint is present on a CFX network. The response sends basic information about the endpoint, including its CFX Handle, and network hostname / address. |
| [EndpointConnected](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_EndpointConnected.htm) | Event/Notification | Sent when an Endpoint joins a CFX network after it has been established. Provides the same information as the response to the AreYouThereRequest message. |
| [EndpointShuttingDown](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_EndpointShuttingDown.htm) | Event/Notification | Sent when an endpoint is about to shut down and disconnect from a CFX network |
| [GetEndpointInformationRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_GetEndpointInformationRequest.htm) | Request | Requests detailed information about a single endpoint, as specified by its CFX Handle. |
| [GetEndpointInformationResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_GetEndpointInformationResponse.htm) | Response | Allows any CFX endpoint to request the capabilities of a specified single endpoint. The response includes information about the endpoint, including its CFX Handle, and network hostname / address. |
| [Heartbeat](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Heartbeat.htm) | Event/Notification | All endpoints are obligated to publish a Heartbeast message on all Publish type no less than once every 5 minutes. The class automatically performs this function for you when using the CFX SDK. |
| [NotSupportedResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_NotSupportedResponse.htm) | Response | Allows a CFX endpoint to indicate to the sender of a request that it is not able to answer to this particular request There can be several reasons : - Unknown request/response message : appeared in a more recent version of CFX than the one used by the endp |
| [WhoIsThereRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_WhoIsThereRequest.htm) | Request | Allows any CFX endpoint to discover all of the other endpoints participating in this CFX network, and their capabilities. All other CFX endpoints matching the specified criteria must then respond to this broadcast. |
| [WhoIsThereResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_WhoIsThereResponse.htm) | Response | Allows any CFX endpoint to discover all of the other endpoints participating in this CFX network, and their capabilities. All other CFX endpoints must then respond to this broadcast, providing information about themselves. |

### CFX.InformationSystem.DataTransfer

| Message | Kind | Description |
|---|---|---|
| [FileTransferRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_DataTransfer_FileTransferRequest.htm) | Request | ** NOTE: ADDED in CFX 1.4 ** Sent by an endpoint to another endpoint to initiate a file transfer. File transfers may proceed either from the initiator/requester to the recipient (PUSH Mode), OR from recipient to initiator/requester (PULL Mode). |
| [FileTransferResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_DataTransfer_FileTransferResponse.htm) | Response | ** NOTE: ADDED in CFX 1.4 ** Sent by an endpoint in response to a . File transfers may proceed either from the initiator/requester to the recipient (PUSH Mode), OR from recipient to initiator/requester (PULL Mode). |

### CFX.InformationSystem.OperatorValidation

| Message | Kind | Description |
|---|---|---|
| [ValidateOperatorRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_OperatorValidation_ValidateOperatorRequest.htm) | Request | Request that an operator take action now or be responsible for a process endpoint. The opposite endpoint can accept or reject this. Can be used if the MES has advanced user management. Multiple operators must be requested separately. |
| [ValidateOperatorResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_OperatorValidation_ValidateOperatorResponse.htm) | Response | Response to a request that the operator's login was successful or not. |

### CFX.InformationSystem.ProductionScheduling

| Message | Kind | Description |
|---|---|---|
| [WorkOrdersScheduled](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_ProductionScheduling_WorkOrdersScheduled.htm) | Event/Notification | Sent when a Work Order (or Work Order sub-batch) has been scheduled to be executed at a particular work area at a particular time. |
| [WorkOrdersUnscheduled](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_ProductionScheduling_WorkOrdersUnscheduled.htm) | Event/Notification | Sent when a previously scheduled Work Order (or Work Order sub-batch) has been unscheduled at a particular work area at a particular time. |

### CFX.InformationSystem.TopicValidation

| Message | Kind | Description |
|---|---|---|
| [ValidateTopicRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_TopicValidation_ValidateTopicRequest.htm) | Request | ** NOTE: ADDED in CFX 2.0 **Request that a specific topic needs to be validated before continuing the process / operations. |
| [ValidateTopicResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_TopicValidation_ValidateTopicResponse.htm) | Response | ** NOTE: ADDED in CFX 2.0 **Response to a request that a specific topic (e.g., tool, material carrier, recipe, material) was successfull validated or not. |

### CFX.InformationSystem.UnitValidation

| Message | Kind | Description |
|---|---|---|
| [ValidateUnitsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_UnitValidation_ValidateUnitsRequest.htm) | Request | Sent from a process endpoint in order to validate the identifier of the next production unit. Process endpoints, where configured, should send this request before allowing the next unit to enter the process. |
| [ValidateUnitsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_UnitValidation_ValidateUnitsResponse.htm) | Response | Sent from a process endpoint in order to validate the identifier of the next production unit. Process endpoints, where configured, should send this request before allowing the next unit to enter the process. |

### CFX.InformationSystem.WorkOrderManagement

| Message | Kind | Description |
|---|---|---|
| [WorkOrderQuantityUpdated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_WorkOrderManagement_WorkOrderQuantityUpdated.htm) | Event/Notification | Sent when the status of a Work Order (or Work Order sub-batch) has been updated. |
| [WorkOrderStatusUpdated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_WorkOrderManagement_WorkOrderStatusUpdated.htm) | Event/Notification | Sent when the status of a Work Order (or Work Order sub-batch) has been updated. |
| [WorkOrdersCreated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_WorkOrderManagement_WorkOrdersCreated.htm) | Event/Notification | Sent when a new production Work Order is created by an information system (such as ERP or MES). |
| [WorkOrdersDeleted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_WorkOrderManagement_WorkOrdersDeleted.htm) | Event/Notification | Sent when a Work Order (or sub-batch of a Work Order) has been deleted within an information system (such as ERP or MES). |
| [WorkOrdersUpdated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_InformationSystem_WorkOrderManagement_WorkOrdersUpdated.htm) | Event/Notification | A Work Order (or Work Order sub-batch) has been modified / updated within an information systsem (such as ERP or MES). |

### CFX.Maintenance

| Message | Kind | Description |
|---|---|---|
| [GetResourceInformationRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceInformationRequest.htm) | Request | ** NOTE: ADDED in CFX 1.3 ** Requests detailed resource information about a single endpoint, as specified by its CFX Handle. |
| [GetResourceInformationResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceInformationResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Allows any CFX endpoint to request the resource and sub-resources of a specified single endpoint. The endpoint information structure is a dynamic structure, and can vary based on the type of endpoint. |
| [GetResourceMaintenanceAndServiceRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceMaintenanceAndServiceRequest.htm) | Request | ** NOTE: ADDED in CFX 1.3 ** Requests detailed resource maintenance information about a single endpoint, as specified by its CFX Handle. |
| [GetResourceMaintenanceAndServiceResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceMaintenanceAndServiceResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Allows any CFX endpoint to request the resource and sub-resources maintenance and services of a specified single endpoint. The endpoint information structure is a dynamic structure, and can vary based on the type of endpoint. |
| [GetResourceMaintenanceStatusRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceMaintenanceStatusRequest.htm) | Request | ** NOTE: ADDED in CFX 1.3 ** Dynamic response from external systems with detailed information about a resource maintenance status. This is typically used for resource that may undergo maintenance operations (e.g. |
| [GetResourceMaintenanceStatusResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceMaintenanceStatusResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Dynamic response from external systems with detailed information about a resource maintenance status. This is typically used for resource that may undergo maintenance operations (e.g. |
| [GetResourceSetupRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceSetupRequest.htm) | Request | ** NOTE: ADDED in CFX 1.3 ** Requests detailed resource setup information about a single endpoint, as specified by its CFX Handle. |
| [GetResourceSetupResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_GetResourceSetupResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Allows any CFX endpoint to request the resource and sub-resources setup of a specified single endpoint. The endpoint information structure is a dynamic structure, and can vary based on the type of endpoint. |
| [ResourceInformationEvent](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_ResourceInformationEvent.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Allows any CFX endpoint to send the resource and sub-resources of a specified single endpoint. The event can be sent "on change" or "time" base. |
| [ResourceMaintenanceAndServiceEvent](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_ResourceMaintenanceAndServiceEvent.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Allows any CFX endpoint to send the resource and sub-resources maintenance and services of a specified single endpoint. The event can be sent "on change" or "time" base. |
| [ResourceMaintenanceStatusEvent](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_ResourceMaintenanceStatusEvent.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Dynamic event from external systems with detailed information about a resource maintenance status. The event can be sent "on change" or "time" base. |
| [ResourceSetupEvent](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Maintenance_ResourceSetupEvent.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Allows any CFX endpoint to send data about the resource and sub-resources setup. The event can be sent "on change" or "time" base. |

### CFX.Materials.Management

| Message | Kind | Description |
|---|---|---|
| [BlockMaterialsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_BlockMaterialsRequest.htm) | Request | A request to block one or more particular lots or instances of material from use in production. |
| [BlockMaterialsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_BlockMaterialsResponse.htm) | Response | Response to a request block one or more instances of material from use in production |
| [GetMaterialInformationRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_GetMaterialInformationRequest.htm) | Request | A request (typically to an factory level software system) to obtain detailed information about a particular material package (or collection of material packages). |
| [GetMaterialInformationResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_GetMaterialInformationResponse.htm) | Response | Response to a request to obtain detailed information about one or more material packages |
| [MaterialsChainSplit](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsChainSplit.htm) | Event/Notification | Sent when a certain material package chain is is been modified by opening the splice plate and therefore create 2 material chains out of one. No new material ID will be created during this usecase. This use case is operatoed on the station. |
| [MaterialsConsumed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsConsumed.htm) | Event/Notification | Sent by a process endpoint when materials are consumed |
| [MaterialsInitialized](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsInitialized.htm) | Event/Notification | Sent whan one or more new material packages are introduced into the factory environment. |
| [MaterialsJoined](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsJoined.htm) | Event/Notification | Sent when two separate material packages (containing the same part) are joined together. For example, as in the case of the splicing together of multiple reels of embossed tape containing SMD parts. |
| [MaterialsModified](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsModified.htm) | Event/Notification | Sent when the attributes of one or more specific material packages have been altered. |
| [MaterialsRetired](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsRetired.htm) | Event/Notification | Sent when one or more material packages are fully exhausted / depleted |
| [MaterialsSplit](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MaterialsSplit.htm) | Event/Notification | Sent when a a certain quantity of material is removed from a material package to form a new material package. The sum of the new quantities of the old and new material package packages should equal the quantity of the original package. |
| [UnblockMaterialsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_UnblockMaterialsRequest.htm) | Request | A request to unblock one or more particular lots or instances of material from use in production. |
| [UnblockMaterialsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_UnblockMaterialsResponse.htm) | Response | Response to a request to unblock one or more particular lots or instances of material from use in production. |

### CFX.Materials.Management.MSDManagement

| Message | Kind | Description |
|---|---|---|
| [MaterialsExpired](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MSDManagement_MaterialsExpired.htm) | Event/Notification | Sent when one or more MSD material packages have reached their maximum exposure time, and may no longer be used in production (unless reconditioned) |
| [MaterialsOpened](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MSDManagement_MaterialsOpened.htm) | Event/Notification | Sent when one or more MSD material packages have been opened and exposed to the environment |
| [MaterialsPlacedInDryStorage](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MSDManagement_MaterialsPlacedInDryStorage.htm) | Event/Notification | Sent when one or more MSD material packages have been placed into dry storage |
| [MaterialsRemovedFromDryStorage](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MSDManagement_MaterialsRemovedFromDryStorage.htm) | Event/Notification | Sent when one or more MSD material packages have been removed from dry storage |
| [MaterialsRestored](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Management_MSDManagement_MaterialsRestored.htm) | Event/Notification | Sent when one or more MSD material packages have been reconditioned, and restored for use in production |

### CFX.Materials.Storage

| Message | Kind | Description |
|---|---|---|
| [GetLoadedMaterialsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_GetLoadedMaterialsRequest.htm) | Request | A request to a material storage endpoint to obtain a list of all the materials currently stored within the endpoint. |
| [GetLoadedMaterialsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_GetLoadedMaterialsResponse.htm) | Response | A response to a request to a material storage endpoint to obtain a list of all the materials currently stored within the endpoint. |
| [MaterialCarriersLoaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_MaterialCarriersLoaded.htm) | Event/Notification | Sent when a material carrier (typcially containing 1 or more material packages) is loaded at an endpoint. |
| [MaterialCarriersUnloaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_MaterialCarriersUnloaded.htm) | Event/Notification | Sent when a material carrier (typcially containing 1 or more material packages) is unloaded at an endpoint. |
| [MaterialsEmpty](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_MaterialsEmpty.htm) | Event/Notification | Sent when one or more material packages stored at a particular location become fully exhausted / depleted. |
| [MaterialsLoaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_MaterialsLoaded.htm) | Event/Notification | Sent when a material package (potentially contained within a material carrier) is loaded at an endpoint. |
| [MaterialsUnloaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_MaterialsUnloaded.htm) | Event/Notification | Sent when a material package (potentially contained within a material carrier) is unloaded at an endpoint. |
| [SplicePointDetected](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_SplicePointDetected.htm) | Event/Notification | Sent when an endpoint detects a splice point. A splice point is a juncture between two different material packages of the same part that have been pre-joined prior to loading at the material location, or were joined-in-place during production. |
| [ValidateStationSetupRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_ValidateStationSetupRequest.htm) | Request | Request to a process endpoint to validate that the currently loaded materials comply with the setup requirements supplied in this request. |
| [ValidateStationSetupResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Storage_ValidateStationSetupResponse.htm) | Response | Response to a request to a process endpoint to validate that the currently loaded materials comply with the setup requirements supplied by the request. |

### CFX.Materials.Transport

| Message | Kind | Description |
|---|---|---|
| [CheckpointReached](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_CheckpointReached.htm) | Event/Notification | Sent when a group of materials or production units that is being transported through the factory environment arrives at a way point along its path source to destination. |
| [CreateTransportOrderRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_CreateTransportOrderRequest.htm) | Request | ** NOTE: ADDED in CFX 2.0 ** Message request to create transport order; it shall contain all necessary data for one or more transports while leaving sufficient flexibility to make use of different Fleet Manager capabilities. |
| [CreateTransportOrderResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_CreateTransportOrderResponse.htm) | Response | ** NOTE: ADDED in CFX 2.0 ** Message response for a corresponding transport order request. |
| [GetTransportOrderStatusRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_GetTransportOrderStatusRequest.htm) | Request | A request to an endpoint (such as an upper level system, MES, ERP, etc.) to check the status of a particular transport order. A transport order is a directive to move materials / WIP / production units from one location to another. |
| [GetTransportOrderStatusResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_GetTransportOrderStatusResponse.htm) | Response | A response to a request to an endpoint (such as an upper level system, MES, ERP, etc.) to check the status of a particular transport order. |
| [StartTransferRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_StartTransferRequest.htm) | Request | ** NOTE: ADDED in CFX 2. |
| [StartTransferResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_StartTransferResponse.htm) | Response | ** NOTE: ADDED in CFX 2. |
| [TransportOrderCompleted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_TransportOrderCompleted.htm) | Event/Notification | Sent when a transport order has arrived at its final destination. |
| [TransportOrderStarted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_TransportOrderStarted.htm) | Event/Notification | Sent when a new transport order is initiated. A transport order is a directive to move materials / WIP / production units from one location to another. |
| [TransportOrderStatusChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Materials_Transport_TransportOrderStatusChanged.htm) | Event/Notification | Sent when the status of an existing transport order has changed. |

### CFX.Production

| Message | Kind | Description |
|---|---|---|
| [ActivateRecipeRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ActivateRecipeRequest.htm) | Request | Used to activate a named recipe at the process endpoint. The response indicates whether this was successful or not. |
| [ActivateRecipeResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ActivateRecipeResponse.htm) | Response | Response to a request to activate a named recipe at the process endpoint. |
| [ActivitiesExecuted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ActivitiesExecuted.htm) | Event/Notification | Indicates that one or more activities have been performed in the course of processing one or more production units. The activities may or may not be value added. |
| [BlockMaterialLocationsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_BlockMaterialLocationsRequest.htm) | Request | Sent to a process endpoint to block or disable a particular material setup location. This is typically used where a loaded material may become unsuitable for use, for example MSD expiry of an SMT material. |
| [BlockMaterialLocationsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_BlockMaterialLocationsResponse.htm) | Response | Sent to a process endpoint to block or disable a particular material setup location. This is typically used where a loaded material may become unsuitable for use, for example MSD expiry of an SMT material. |
| [GetActiveRecipeRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetActiveRecipeRequest.htm) | Request | Used to request the name of the recipe that is activated at a process endpoint. The response indicates the name of the recipe. |
| [GetActiveRecipeResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetActiveRecipeResponse.htm) | Response | Used to request the name of the recipe that is activated at a process endpoint. The response indicates the name of the recipe. |
| [GetAvailableRecipesRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetAvailableRecipesRequest.htm) | Request | ** NOTE: ADDED in CFX 1.4 ** This message is used to request a process endpoint for the available recipes. |
| [GetAvailableRecipesResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetAvailableRecipesResponse.htm) | Response | ** NOTE: ADDED in CFX 1.4 ** Response to a request of getting the available recipes. The response includes a list of recipes (name, revision), but not their data. |
| [GetRecipeRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetRecipeRequest.htm) | Request | This message is used to request a process endpoint for the details of a named recipe. The response includes details of the recipe, depending on the classification of the process. |
| [GetRecipeResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetRecipeResponse.htm) | Response | This message is used to request a process endpoint for the details of a named recipe. The response includes details of the recipe, depending on the classification of the process. |
| [GetRequiredSetupRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetRequiredSetupRequest.htm) | Request | Sent to a process endpoint to request the setup requirements of the active recipe. The response lists the required materials and tools, along with the locations where the materials/tools must be loaded. |
| [GetRequiredSetupResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetRequiredSetupResponse.htm) | Response | Response from a process endpoint to a request to obtain the setup requirements of the active recipe. The response lists the required materials and tools, along with the locations where the materials/tools must be loaded. |
| [GetUnitInfoRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetUnitInfoRequest.htm) | Request | ** NOTE: ADDED in CFX 1. |
| [GetUnitInfoResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_GetUnitInfoResponse.htm) | Response | ** NOTE: ADDED in CFX 1.4 ** Response from a process endpoint to a request to obtatin Unit information. The reponse lists the units and the related information (e.g. |
| [LocalRecipeChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_LocalRecipeChanged.htm) | Event/Notification | ** NOTE: ADDED in CFX 2. |
| [LockStationRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_LockStationRequest.htm) | Request | Request that the endpoint cease active operation (locked) as soon as practically possible at a process endpoint. A specific production lane or stage may be optionally specified. Includes a reason, and applies to all operations. |
| [LockStationResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_LockStationResponse.htm) | Response | Response to a request that the endpoint cease active operation (locked) as soon as practically possible at a process endpoint. |
| [OperatorActivated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_OperatorActivated.htm) | Event/Notification | Indicates that an operator is now active at or responsible for a process endpoint. Having multiple operators (each needs to be activated and deactivated separately) or an absence of an operator is possible. |
| [OperatorDeactivated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_OperatorDeactivated.htm) | Event/Notification | Indicates that an activated operator is no longer active or responsible at a process endpoint |
| [ReadingsRecorded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ReadingsRecorded.htm) | Event/Notification | A process endpoint uses this message to send a data object that has been acquired for example from a sensor or a reading taken during processing of the unit. This data is typically used as a traceability record. |
| [RecipeActivated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_RecipeActivated.htm) | Event/Notification | Sent by a process endpoint to indicate the activation of a recipe by its name |
| [RecipeDeactivated](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_RecipeDeactivated.htm) | Event/Notification | ** NOTE: ADDED in CFX 1. |
| [RecipeModified](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_RecipeModified.htm) | Event/Notification | Sent by a process endpoint to indicate that a change has been made to a specified named recipe. |
| [SetupRequirementsChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_SetupRequirementsChanged.htm) | Event/Notification | Sent whenever the setup requirement of materials, tools, etc. are changed for any reason at a process endpoint. This message contains a detailed listing of the required items, and their designated positions. |
| [ToolsCleaned](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ToolsCleaned.htm) | Event/Notification | ** NOTE: ADDED in CFX 1. |
| [ToolsLoaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ToolsLoaded.htm) | Event/Notification | ** NOTE: ADDED in CFX 1. |
| [ToolsUnloaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ToolsUnloaded.htm) | Event/Notification | ** NOTE: ADDED in CFX 1. |
| [ToolsUsed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ToolsUsed.htm) | Event/Notification | Sent by a process endpoint when one or more tools are used in the course of performing an assembly operation. |
| [UnblockMaterialLocationsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnblockMaterialLocationsRequest.htm) | Request | Sent to a process endpoint to release a material locations block which was put into place by a previously sent BlockMaterialLocationsRequest |
| [UnblockMaterialLocationsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnblockMaterialLocationsResponse.htm) | Response | Response to UnblockMaterialLocationsRequest |
| [UnitsArrived](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnitsArrived.htm) | Event/Notification | Sent when production units physically arrives at a process endpoint, prior to any work or other activity commencing. |
| [UnitsDeparted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnitsDeparted.htm) | Event/Notification | Sent by a process endpoint when units physically depart from a process endpoint. This does not imply any information about any activity that may have taken place. |
| [UnitsDisqualified](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnitsDisqualified.htm) | Event/Notification | Sent by a process endpoint to identify that a specific production unit is disqualified or scrapped. |
| [UnitsInitialized](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnitsInitialized.htm) | Event/Notification | Sent when one or more production units are first introduced into the production process flow. |
| [UnlockStationRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnlockStationRequest.htm) | Request | Request that a process endpoint resume production, following a previous lock. The response indicates that the lock has been removed. |
| [UnlockStationResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UnlockStationResponse.htm) | Response | Response to a request for a process endpoint to resume production, following a previous lock. |
| [UpdateRecipeRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UpdateRecipeRequest.htm) | Request | This message is used to send a named recipe to a process endpoint. The message includes details of the recipe, depending on the classification of the process. The response indicates whether the recipe has been received correctly or not. |
| [UpdateRecipeResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_UpdateRecipeResponse.htm) | Response | This message is used to send a named recipe to a process endpoint. The message includes details of the recipe, depending on the classification of the process. The response indicates whether the recipe has been received correctly or not. |
| [WorkCompleted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkCompleted.htm) | Event/Notification | Sent by a process endpoint when all work has been completed at a process endpoint. |
| [WorkOrderActionExecuted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkOrderActionExecuted.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.2 ** Sent when a non-added value action (out of production) relative to a work order is started, aborted or completed by a process endpoint. |
| [WorkStageCompleted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkStageCompleted.htm) | Event/Notification | Sent by a process endpoint to indicate that a stage has been completed. |
| [WorkStagePaused](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkStagePaused.htm) | Event/Notification | Sent when activity pauses for some reason at a stage of the process endpoint |
| [WorkStageResumed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkStageResumed.htm) | Event/Notification | Sent when activity recommences at a stage within a process endpoint, following a WorkStagePaused message |
| [WorkStageStarted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkStageStarted.htm) | Event/Notification | Sent by a process endpoint when the work-stage for a unit or group of units starts |
| [WorkStarted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_WorkStarted.htm) | Event/Notification |  |

### CFX.Production.Application

| Message | Kind | Description |
|---|---|---|
| [MaterialsApplied](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Application_MaterialsApplied.htm) | Event/Notification | Sent when material is applied to a production unit, such as glue, adhesives, coatings, solder, paste, etc. ** NOTE: ADDED in CFX 2. |
| [MaterialsUnapplied](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Application_MaterialsUnapplied.htm) | Event/Notification | Sent when material is unapplied or removed from a production unit, as in the case of paste being wiped clean, for example. |

### CFX.Production.Application.Solder

| Message | Kind | Description |
|---|---|---|
| [PCBSelectiveSoldered](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Application_Solder_PCBSelectiveSoldered.htm) | Event/Notification |  |

### CFX.Production.Assembly

| Message | Kind | Description |
|---|---|---|
| [MaterialsInstalled](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Assembly_MaterialsInstalled.htm) | Event/Notification | Sent by a process endpoint when one or more materials (see note) are installed on to a production unit. This message is typically sent at the completion of production on a unit or group of units at the endpoint, or, at the end of each stage. |
| [MaterialsUninstalled](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Assembly_MaterialsUninstalled.htm) | Event/Notification | Sent by a process endpoint when one or more materials (see note) are removed from a production unit. This message is typically sent at the completion of a production unit or group of units at the endpoint, or, at the end of each stage. |
| [UnitsPersonalized](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Assembly_UnitsPersonalized.htm) | Event/Notification | Sent by a process endpoint when a configuration or assignment is made (example MAC Address) |

### CFX.Production.Assembly.PressInsertion

| Message | Kind | Description |
|---|---|---|
| [ConditionCompleted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Assembly_PressInsertion_ConditionCompleted.htm) | Event/Notification | Sent by a press insertion machine when a condition has been completed |
| [GetConditionPermissionRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Assembly_PressInsertion_GetConditionPermissionRequest.htm) | Request | This message is used to request a process endpoint for permission to proceed with the recipe based on the results of a condition sequence action |
| [GetConditionPermissionResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Assembly_PressInsertion_GetConditionPermissionResponse.htm) | Response | This message is used to grant or reject permission for a process endpoint to proceed with the recipe based on the results of a condition sequence action. |

### CFX.Production.Hermes

| Message | Kind | Description |
|---|---|---|
| [GetMagazineDataRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Hermes_GetMagazineDataRequest.htm) | Request | ** NOTE: ADDED in CFX 1. |
| [GetMagazineDataResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Hermes_GetMagazineDataResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Reponse to a request by a Hermes enabled endpoint to acquire information related to a particular magazine. |
| [GetWorkOrderDataRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Hermes_GetWorkOrderDataRequest.htm) | Request | Used by an endpoint to acquire information related to a particular work order (typically at the beginning of a Hermes enabled line). This information would typically then be passed down the line through the Hermes protocol / mechanism. |
| [GetWorkOrderDataResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Hermes_GetWorkOrderDataResponse.htm) | Response | Reponse to a request by a Hermes enabled endpoint to acquire information related to a particular work order. |
| [MagazineArrived](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Hermes_MagazineArrived.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Event triggered by a Hermes enabled endpoint when a magazine arrived. |
| [MagazineDeparted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Hermes_MagazineDeparted.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Event triggered by a Hermes enabled endpoint when a magazine departed. |

### CFX.Production.LoadingAndUnloading

| Message | Kind | Description |
|---|---|---|
| [UnitsLoaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_LoadingAndUnloading_UnitsLoaded.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.2 ** Sent when a unit is loaded from any form of carrier, including fixtures, pallets, trays, tubs, totes, carts, etc. |
| [UnitsUnloaded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_LoadingAndUnloading_UnitsUnloaded.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.2 ** Sent when a unit is unloaded into any form of carrier, including fixtures, pallets, trays, tubs, totes, carts, etc. Associates unit with a carrier. |

### CFX.Production.Processing

| Message | Kind | Description |
|---|---|---|
| [UnitsProcessed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_Processing_UnitsProcessed.htm) | Event/Notification | Sent when an endpoint processes one or more production units within the scope of a work transaction. Contains dynamic structures that vary based upon the type of processing that was performed. |

### CFX.Production.ReworkAndRepair

| Message | Kind | Description |
|---|---|---|
| [UnitsRepaired](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_ReworkAndRepair_UnitsRepaired.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.4 ** Sent by a process endpoint when one or more units have been reworked or repaird. Includes outcome information, as well as a detailed report of the repair(s) performed. |

### CFX.Production.TestAndInspection

| Message | Kind | Description |
|---|---|---|
| [GetInspectionInfoRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_TestAndInspection_GetInspectionInfoRequest.htm) | Request | ** NOTE: ADDED in CFX 1. |
| [GetInspectionInfoResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_TestAndInspection_GetInspectionInfoResponse.htm) | Response | ** NOTE: ADDED in CFX 1. |
| [UnitsInspected](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_TestAndInspection_UnitsInspected.htm) | Event/Notification | Sent by a process endpoint when one or more units have been inspected. |
| [UnitsTested](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Production_TestAndInspection_UnitsTested.htm) | Event/Notification | Sent by a process endpoint when one or more units undergo a series of tests. Tests can be of any form, including environmental testing, electrical testing, functional testing, etc. |

### CFX.ResourcePerformance

| Message | Kind | Description |
|---|---|---|
| [CalibrationPerformed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_CalibrationPerformed.htm) | Event/Notification | Sent when calibration of any sort has been performed at an endpoint. |
| [ChangeSleepStateRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ChangeSleepStateRequest.htm) | Request | ** NOTE: ADDED in CFX 1.3 ** This request allows an external source to change the sleep state of a Stage or Station message that it sends back to the requester. |
| [ChangeSleepStateResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ChangeSleepStateResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Response to an external source to modify a generic configuration parameter of a process endpoint. |
| [ConsumptionDetail](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ConsumptionDetail.htm) | Event/Notification |  |
| [EnergyConsumed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_EnergyConsumed.htm) | Event/Notification | Sent by a process endpoint on a sampled interval of between 1 minute and 1 hour to indicate the energy usage and power consumption. |
| [EnergyConsumptionRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_EnergyConsumptionRequest.htm) | Request | ** NOTE: ADDED in CFX 1.3 ** This request allows an external source to inquire data regarding energy consumption of the endpoint message that it sends back to the requester. |
| [EnergyConsumptionResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_EnergyConsumptionResponse.htm) | Response | ** NOTE: ADDED in CFX 1.3 ** Response to an external source inquiring data regarding energy consumption of the endpoint. |
| [FaultAcknowledged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_FaultAcknowledged.htm) | Event/Notification | Sent when a fault has been acknowledged by the operator, but not yet corrected (cleared). A subsequent FaultCleared message will be sent once the operator addresses the issue. |
| [FaultCleared](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_FaultCleared.htm) | Event/Notification | Sent by a process endpoint when a fault is cleared as described in a FaultOccurred message |
| [FaultOccurred](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_FaultOccurred.htm) | Event/Notification | Sent by a process endpoint whenever a fault is encountered. A data structure must be included in the message related to specific equipment type. |
| [GetActiveFaultsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_GetActiveFaultsRequest.htm) | Request | This request allows an external source to query the equipment for a list of active faults. message that it sends back to the requester. |
| [GetActiveFaultsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_GetActiveFaultsResponse.htm) | Response | Response to an external source to modify a generic configuration parameter of a process endpoint. |
| [HandleFaultRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_HandleFaultRequest.htm) | Request | This request allows an external source to modify the behaviour for this dedicated fault in such a way that the equoipment itself is not indicating the operator to handle this fault. |
| [HandleFaultResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_HandleFaultResponse.htm) | Response | Response to an external source to modify the behaviour for the equipment to guide the operator process endpoint. |
| [LogEntryRecorded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_LogEntryRecorded.htm) | Event/Notification | An informational message sent by a process endpoint regarding the something that has occurred at the station. Information about the criticality of the information should also be given (information, warning, error etc.). |
| [MaintenancePerformed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_MaintenancePerformed.htm) | Event/Notification | Sent by an endpoint when maintenance has been performed. Information includes the type of maintenance, maintenance code, parts used, labor etc. |
| [ModifyStationParametersRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ModifyStationParametersRequest.htm) | Request | This request allows an external source to modify a generic configuration parameter of a process endpoint. Upon successful processing of this request, the endpoint should publish a message in addition to the message that it sends back to the requester. |
| [ModifyStationParametersResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ModifyStationParametersResponse.htm) | Response | Response to an external source to modify a generic configuration parameter of a process endpoint. |
| [ProcessDataRecorded](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ProcessDataRecorded.htm) | Event/Notification | ** NOTE: ADDED in CFX 1. |
| [SleepStateChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SleepStateChanged.htm) | Event/Notification | ** NOTE: ADDED in CFX 1.3 ** Sent by a process endpoint when the sleep state transitions from one state to another. |
| [StageStateChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_StageStateChanged.htm) | Event/Notification | Sent by a process endpoint when the production state of one of its stages transitions from one state to another per its state model. |
| [StationOffline](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_StationOffline.htm) | Event/Notification | Sent by a process endpoint when it is about to transition to a state where it is not possible for further communication, for example when the endpoint is powered down, reset, put into maintenance mode, or simply set off-line. |
| [StationOnline](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_StationOnline.htm) | Event/Notification | Sent by a process endpoint when it is ready for communication to resume, for example, powered up, maintenance over, etc. |
| [StationParametersModified](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_StationParametersModified.htm) | Event/Notification | Sent by a process endpoint to indicate that an operator has modified a generic parameter or configuration setting. This does not apply to settings related to recipes, which are handled by the RecipeModified event. |
| [StationStateChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_StationStateChanged.htm) | Event/Notification | Sent by a process endpoint when the production state transitions from one state to another per its state model. |
| [ToolChanged](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_ToolChanged.htm) | Event/Notification | Sent when a new tool is selected for active use at a production endpoint Example 1 (Generic tool change):Example 2 (Nozzle change on SMT placement machine): |

### CFX.ResourcePerformance.PressInsertion

| Message | Kind | Description |
|---|---|---|
| [ComponentsPressed](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_PressInsertion_ComponentsPressed.htm) | Event/Notification | Sent periodically by a Press Fit machine to indicate the number of presses which were successfully or unsuccessfully completed during the sample time window. |

### CFX.ResourcePerformance.SMTPlacement

| Message | Kind | Description |
|---|---|---|
| [ComponentsPlaced](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SMTPlacement_ComponentsPlaced.htm) | Event/Notification | Sent periodically by an SMT placement machine to indicate the number of placements which were successfully or unsuccessfully completed during the sample time window. This sample time window shall not exceed 10 minutes. |

### CFX.ResourcePerformance.SolderPastePrinting

| Message | Kind | Description |
|---|---|---|
| [CleanSqueegeeRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SolderPastePrinting_CleanSqueegeeRequest.htm) | Request | Allows an external source to direct a request to a stencil printer to perform a squeegee clean operation |
| [CleanSqueegeeResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SolderPastePrinting_CleanSqueegeeResponse.htm) | Response | Response to a request from an external source for a squeegee clean operation to be performed |
| [CleanStencilRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SolderPastePrinting_CleanStencilRequest.htm) | Request | Allows an external source to direct a request to a stencil printer to perform a stencil clean operation |
| [CleanStencilResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SolderPastePrinting_CleanStencilResponse.htm) | Response | A response to a request by a remote party for a stencil printer to perform a stencil clean operation |
| [SqueegeeCleaned](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SolderPastePrinting_SqueegeeCleaned.htm) | Event/Notification | Indicates that a squeegee clean operation has been performed |
| [StencilCleaned](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_SolderPastePrinting_StencilCleaned.htm) | Event/Notification | Indicates that a stencil clean operation has been performed |

### CFX.ResourcePerformance.THTInsertion

| Message | Kind | Description |
|---|---|---|
| [ComponentsInserted](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_ResourcePerformance_THTInsertion_ComponentsInserted.htm) | Event/Notification | Sent periodically by an THT inserter to indicate the number of insertions which were successfully or unsuccessfully completed during the sample time window. This sample time window shall not exceed 10 minutes. |

### CFX.Sensor.Identification

| Message | Kind | Description |
|---|---|---|
| [IdentifiersNotRead](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Sensor_Identification_IdentifiersNotRead.htm) | Event/Notification | Sent by an identification device (barcode scanner, RFID reader, etc.) when the device attempts to read or interpret an identifier, but is unable to do so. |
| [IdentifiersRead](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Sensor_Identification_IdentifiersRead.htm) | Event/Notification | Sent by an identification device (barcode scanner, RFID reader, etc. |
| [IdentifyUnitsRequest](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Sensor_Identification_IdentifyUnitsRequest.htm) | Request | Sent by a process endpoint to a unit identification device (such as a barcode scanner or RFID reader) to request the most recently scanned unit identifiers. |
| [IdentifyUnitsResponse](https://www.connectedfactoryexchange.com/CFXDemo/sdk/html/T_CFX_Sensor_Identification_IdentifyUnitsResponse.htm) | Response | Response from a unit identification device (such as a barcode scanner or RFID reader) to a process endpoint which contains the most recently scanned unit identifiers. |
