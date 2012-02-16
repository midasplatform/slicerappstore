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

/** Controller for the list of all extensions */
class Slicerappstore_IndexController extends Slicerappstore_AppController
{
  /**
   * Action for rendering the page that lists extensions
   * @param slicerView Set this if you're accessing this page from within the Slicer web view.
   */
  function indexAction()
    {
    $modelLoader = new MIDAS_ModelLoader();
    $extensionModel = $modelLoader->loadModel('Extension', 'slicerpackages');

    $slicerView = $this->_getParam('slicerView');
    $this->view->slicerView = isset($slicerView);
    if($this->view->slicerView)
      {
      $this->disableLayout();
      }
    else
      {
      //$this->view->availableVersions = $extensionModel->getAllReleases();
      $this->view->availableVersions = array('4.0.0', '4.0.1');
      }
    //$this->view->allCategories = $extensionModel->getAllCategories();
    $this->view->allCategories = array('Top Level 1.Subcategory.Leaf',
                                       'Other Top Level.Subcategory A.Hello World',
                                       'Other Top Level.Subcategory B');
    sort($this->view->allCategories);
    }

  /**
   * Call with ajax and filter parameters to get a list of extensions
   * @param category
   * @param os
   * @param arch
   * @param version
   * @param limit
   * @param offset
   */
  function listextensionsAction()
    {
    $this->disableLayout();
    $this->disableView();

    $packages = array();
    for($i = 0; $i < 20; $i++)
      {
      $packages[] = array('slicerpackages_extension_id' => $i+1,
                          'productname' => 'Extension name '.($i+1),
                          'subtitle' => 'Author names',
                          'icon' => 'http://cdn2.iconfinder.com/data/icons/Siena/128/puzzle%20yellow.png',
                          'ratings' => array('average' => 4.25, 'total' => 270));
      }
    echo JsonComponent::encode($packages);
    }

} // end class
