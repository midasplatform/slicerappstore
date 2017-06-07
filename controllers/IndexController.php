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
   * Gets FolderDaos for package type and submission type
   */
  private function _getPackageFolder($packagetype, $submissiontype)
    {
    $modelLoader = new MIDAS_ModelLoader();
    $settingModel = $modelLoader->loadModel('Setting');
    $folderModel = $modelLoader->loadModel('Folder');
    $key = strtolower($packagetype).'s.'.$submissiontype.'.folder';
    $folderId = $settingModel->getValueByName($key, 'slicerpackages');
    if(!$folderId || !is_numeric($folderId))
      {
      throw new Exception('You must configure a folder id for key '.$key, -1);
      }
    $folder = $folderModel->load($folderId);
    if(!$folder)
      {
      throw new Exception('Folder with id '.$folderId.' does not exist', -1);
      }
    if(!$folderModel->policyCheck($folder, $this->userSession->Dao, MIDAS_POLICY_READ))
      {
      throw new Exception('Invalid policy on folder '.$folderId, -1);
      }
    return $folder;
    }

  /**
   * Action for rendering the page that lists extensions
   * @param os (Optional) The default operating system to filter by
   * @param arch (Optional) The default architecture to filter by
   * @param release (Optional) The default release to filter by
   */
  function indexAction()
    {
    $extensionModel = MidasLoader::loadModel('Extension', 'slicerpackages');
    $packageModel = MidasLoader::loadModel('Package', 'slicerpackages');

    $layout = $this->_getParam('layout');
    if(!isset($layout) || $layout != 'empty')
      {
      $this->view->availableReleases = $extensionModel->getAllReleases();
      $this->view->layout = 'layout';
      }

    $defaultRevision = '';
    if (!$this->hasParam('revision'))
      {
      $folderDaos = array(
        $this->_getPackageFolder('Package', 'nightly'));
      $defaultRevision = $packageModel->getMostRecentRevision($folderDaos);
      }

    foreach(array('os', 'arch', 'release', 'revision', 'category', 'search') as $option)
      {
      $default = '';
      if ($option == 'revision')
        {
        $default = $defaultRevision;
        }
      $this->view->json[$option] = $this->_getParam($option, $default);
      }
    $this->view->layout = $this->view->json['layout'];
    }

  /**
   * If a filter param changes on the normal layout view, call into this
   * to retrieve updated category counts based on the current filter
   */
  function categoriesAction()
    {
    $this->disableLayout();
    $this->disableView();

    $filterParams = array();
    foreach(array('os' => 'os', 'arch' => 'arch',
                  'revision' => 'slicer_revision',
                  'search' => 'search') as $option => $key)
      {
      $value = $this->_getParam($option);
      if($value)
        {
        $filterParams[$key] = $value;
        }
      // Explicitly setting revision to empty string so that database returns correct counts
      if(empty($value) and $option == 'revision')
        {
        $filterParams[$key] = '';
        }
      }
    $extensionModel = MidasLoader::loadModel('Extension', 'slicerpackages');
    $categories = $extensionModel->getCategoriesWithCounts($filterParams);
    ksort($categories);
    echo JsonComponent::encode($categories);
    }

  /**
   * Call with ajax and filter parameters to get a list of extensions
   * @param category The category filter
   * @param os The os filter (win | linux | macosx)
   * @param arch The architecture filter (i386 | amd64)
   * @param release The release filter
   * @param limit Pagination limit
   * @param offset Pagination offset
   * @param search The search text
   */
  function listextensionsAction()
    {
    $this->disableLayout();
    $this->disableView();
    $category = $this->_getParam('category', 'any');
    $os = $this->_getParam('os');
    $arch = $this->_getParam('arch');
    $release = $this->_getParam('release', 'any');
    $revision = $this->_getParam('revision');
    $limit = $this->_getParam('limit', 0);
    $offset = $this->_getParam('offset', 0);
    $search = $this->_getParam('search', '');

    $modelLoader = new MIDAS_ModelLoader();
    $settingModel = $modelLoader->loadModel('Setting');
    $itemratingModel = $modelLoader->loadModel('Itemrating', 'ratings');
    $extensionModel = $modelLoader->loadModel('Extension', 'slicerpackages');
    $extensions = $extensionModel->get(array('os' => $os,
                                          'arch' => $arch,
                                          'release' => $release,
                                          'category' => $category,
                                          'slicer_revision' => $revision,
                                          'limit' => $limit,
                                          'offset' => $offset,
                                          'search' => $search));
    $defaultIcon = $settingModel->getValueByName('defaultIcon', $this->moduleName);

    $results = array();
    foreach($extensions['extensions'] as $extension)
      {
      $icon = $extension->getIconUrl();
      if(!$icon)
        {
        $icon = $defaultIcon;
        }
      $contributors = $extension->getContributors();
      if($contributors == '')
        {
        $contributors = 'Unknown contributors';
        }
      $result = array('slicerpackages_extension_id' => $extension->getKey(),
                      'item_id' => $extension->getItemId(),
                      'icon' => $icon,
                      'productname' => $extension->getProductname(),
                      'category' => $extension->getCategory(),
                      'subtitle' => $contributors);
      $result['ratings'] = $itemratingModel->getAggregateInfo($extension->getItem());
      $results[] = $result;
      }
    echo JsonComponent::encode(array('extensions' => $results, 'total' => $extensions['total']));
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

  /**
   * Call this to render the kitware info dialog
   */
  public function kwinfoAction()
    {
    $this->disableLayout();
    }
} // end class
