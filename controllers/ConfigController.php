<?php
/*=========================================================================
 MIDAS Server
 Copyright (c) Kitware SAS. 26 rue Louis Guérin. 69100 Villeurbanne, FRANCE
 All rights reserved.
 More information http://www.kitware.com

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0.txt

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
=========================================================================*/

/** Module configure controller */
class Slicerappstore_ConfigController extends Slicerappstore_AppController
{
  public $_moduleForms = array('Config');
  public $_components = array();

  /** index action */
  function indexAction()
    {
    if(!$this->logged || !$this->userSession->Dao->getAdmin() == 1)
      {
      throw new Zend_Exception('You should be an administrator');
      }

    $modelLoader = new MIDAS_ModelLoader();
    $settingModel = $modelLoader->loadModel('Setting');
    $defaultIconSetting = $settingModel->getValueByName('defaultIcon', $this->moduleName);

    $configForm = $this->ModuleForm->Config->createConfigForm();

    $formArray = $this->getFormAsArray($configForm);
    if($defaultIconSetting)
      {
      $formArray['defaultIcon']->setValue($defaultIconSetting);
      }

    $this->view->configForm = $formArray;

    if($this->_request->isPost())
      {
      $this->disableLayout();
      $this->_helper->viewRenderer->setNoRender();
      $submitConfig = $this->_getParam('submitConfig');
      if(isset($submitConfig))
        {
        $settingModel->setConfig('defaultIcon',
                                 $this->_getParam('defaultIcon'),
                                 $this->moduleName);
        echo JsonComponent::encode(array(true, 'Changes saved'));
        }
      }

    } // end indexAction

} // end class
