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
   * @param os (Optional) The default operating system to filter by
   * @param arch (Optional) The default architecture to filter by
   * @param release (Optional) The default release to filter by
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
                                       'Top Level 1.Subcategory.Leaf2',
                                       'Top Level 1.Subcategory.Leaf3',
                                       'Top Level 1.Subcategory.Leaf4',
                                       'Other Top Level.Subcategory C',
                                       'Other Top Level.Subcategory A.Hello World',
                                       'Other Top Level.Subcategory A.A Cat',
                                       'Other Top Level.Subcategory B');
    sort($this->view->allCategories);

    $os = $this->_getParam('os');
    $arhc = $this->_getParam('arch');
    $release = $this->_getParam('release');
    $this->view->os = isset($os) ? $os : 'win';
    $this->view->arch = isset($os) ? $os : 'i386';
    $this->view->release = isset($os) ? $os : '4.0.0';
    }

  /**
   * Call with ajax and filter parameters to get a list of extensions
   * @param category The category filter
   * @param os The os filter (win | linux | macosx)
   * @param arch The architecture filter (i386 | amd64)
   * @param release The release filter
   * @param limit (Unused currently) Pagination limit
   * @param offset (Unused currently) Pagination offset
   */
  function listextensionsAction()
    {
    $this->disableLayout();
    $this->disableView();
    $category = $this->_getParam('category');

    $packages = array();
    for($i = 0; $i < 15; $i++)
      {
      $packages[] = array('slicerpackages_extension_id' => $i+1,
                          'productname' => $category.' extension '.($i+1),
                          'subtitle' => 'Author names',
                          'icon' => 'http://cdn2.iconfinder.com/data/icons/Siena/128/puzzle%20yellow.png',
                          'ratings' => array('average' => 4.27, 'total' => 270));
      }
    echo JsonComponent::encode($packages);
    }

} // end class
