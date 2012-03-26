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

/** Controller for individual extensions */
class Slicerappstore_ExtensionController extends Slicerappstore_AppController
{
  /**
   * Action for rendering the extension page
   * @param extensionId The extension id to view
   */
  function viewAction()
    {
    $modelLoader = new MIDAS_ModelLoader();
    $settingModel = $modelLoader->loadModel('Setting');
    $extensionModel = $modelLoader->loadModel('Extension', 'slicerpackages');
    $extension = $extensionModel->load($this->_getParam('extensionId'));
    if(!$extension)
      {
      throw new Zend_Exception('Invalid extensionId');
      }
    $this->view->extension = $extension;
    $this->view->json['extension'] = $extension;
    $this->view->json['item'] = $extension->getItem();
    $this->view->icon = $extension->getIconUrl();
    if(!$this->view->icon)
      {
      $this->view->icon = $settingModel->getValueByName('defaultIcon', $this->moduleName);
      }
    $this->view->json['icon'] = $this->view->icon;

    $this->view->logged = $this->logged;

    $itemratingModel = $modelLoader->loadModel('Itemrating', 'ratings');
    $this->view->json['modules']['ratings'] = $itemratingModel->getAggregateInfo($extension->getItem());
    if($this->userSession->Dao)
      {
      $this->view->json['modules']['ratings']['userRating'] = $itemratingModel->getByUser($this->userSession->Dao, $extension->getItem());
      }
    
    $componentLoader = new MIDAS_ComponentLoader();
    $commentComponent = $componentLoader->loadComponent('Comment', 'comments');
    list($comments, $total) = $commentComponent->getComments($extension->getItem(), 10, 0);
    $this->view->json['modules']['comments'] = array('comments' => $comments,
                                  'total' => $total,
                                  'user' => $this->userSession->Dao);

    $this->view->layout = $this->view->json['layout'];
    }
} // end class
