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
      $this->view->availableVersions = $extensionModel->getAllReleases();
      }
    $this->view->allCategories = $extensionModel->getAllCategories();
    sort($this->view->allCategories);

    $os = $this->_getParam('os');
    $arch = $this->_getParam('arch');
    $release = $this->_getParam('release');
    $revision = $this->_getParam('revision');
    $this->view->os = isset($os) ? $os : '';
    $this->view->arch = isset($arch) ? $arch : '';
    $this->view->release = isset($release) ? $release : '';
    $this->view->revision = isset($revision) ? $revision : '';
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
    if(!$category)
      {
      $category = 'any';
      }
    $os = $this->_getParam('os');
    if(!$os)
      {
      $os = 'any';
      }
    $arch = $this->_getParam('arch');
    if(!$arch)
      {
      $arch = 'any';
      }
    $release = $this->_getParam('release');
    if(!$release)
      {
      $release = 'any';
      }
    $revision = $this->_getParam('revision');
    if(!$revision)
      {
      $revision = 'any';
      }

    $modelLoader = new MIDAS_ModelLoader();
    $settingModel = $modelLoader->loadModel('Setting');
    $itemratingModel = $modelLoader->loadModel('Itemrating', 'ratings');
    $extensionModel = $modelLoader->loadModel('Extension', 'slicerpackages');
    $extensions = $extensionModel->get(array('os' => $os,
                                             'arch' => $arch,
                                             'release' => $release,
                                             'category' => $category,
                                             'slicer_revision' => $revision));
    $defaultIcon = $settingModel->getValueByName('defaultIcon', $this->moduleName);

    $results = array();
    foreach($extensions as $extension)
      {
      $icon = $extension->getIconUrl();
      if(!$icon)
        {
        $icon = $defaultIcon;
        }
      $result = array('slicerpackages_extension_id' => $extension->getKey(),
                      'item_id' => $extension->getItemId(),
                      'icon' => $icon,
                      'productname' => $extension->getProductname(),
                      'category' => $extension->getCategory(),
                      'subtitle' => 'contributor list'); //dummy until we decide what to put in the subtitle
      $result['ratings'] = $itemratingModel->getAggregateInfo($extension->getItem());
      $results[] = $result;
      }
    echo JsonComponent::encode($results);
    }

  /**
   * Used to download an extension. Simply forwards the request to the core item download controller
   * for the extension's corresponding item.
   * @param extensionId The id of the extension to download
   */
  public function downloadextensionAction()
    {
    $extensionId = $this->_getParam('extensionId');
    $modelLoader = new MIDAS_ModelLoader();
    $extensionModel = $modelLoader->loadModel('Extension', 'slicerpackages');
    $extension = $extensionModel->load($extensionId);

    if(!$extension)
      {
      throw new Zend_Exception('Invalid extensionId parameter');
      }
    // Redirect to the download controller with the extension's item id
    $this->_redirect('/download/index?items='.$extension->getItemId());
    }

} // end class
